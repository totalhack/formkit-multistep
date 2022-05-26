import { reactive, toRef, ref } from 'vue'
import { createMessage } from '@formkit/core'

export default function useSteps() {
  const activeStep = ref('')
  const steps = reactive({})
  let defaultOrder = [];
  let stepOrder = ref([])

  const setStepOrder = (order) => {
    // TODO verify valid steps
    stepOrder.value = order
    console.log("new stepOrder", order)
  }

  const firstStep = () => {
    const stepNames = Object.keys(steps)
    return stepNames[0];
  }

  const lastStep = () => {
    return stepOrder.value[stepOrder.value.length - 1]
  }

  const currentIndex = () => {
    return stepOrder.value.indexOf(activeStep.value)
  }

  const setStepIndex = (index) => {
    activeStep.value = stepOrder.value[index]
  }

  const setStepName = (name) => {
    const index = stepOrder.value.indexOf(name)
    if (index < 0) {
      throw Error('Invalid step name ' + name)
    }
    activeStep.value = stepOrder.value[index];
  }

  const setStep = ({ nextStep = 1, validate = true } = {}) => {
    console.log("activeStep", activeStep.value, "nextStep", nextStep, "validate", validate)
    if (validate) {
      const currentStep = activeStep.value;
      console.log("validating ", currentStep)
      const node = steps[currentStep].node
      node.walk((n) => {
        n.store.set(
          createMessage({
            key: 'submitted',
            value: true,
            visible: false,
          })
        )
      })
      if (!node.context.state.valid) {
        return
      }
    }

    // TODO behavior if invalid step name?
    if (nextStep instanceof Function) {
      const nextStep = nextStepFunc()
      setStepName(nextStep)
    } else if (typeof (nextStep) === 'string') {
      setStepName(nextStep)
    } else if (typeof (nextStep) === 'number') {
      setStepIndex(nextStep)
    } else {
      throw Error("Unexpected value for nextStep: " + nextStep)
    }
  }

  const setNextStep = () => {
    setStep({ nextStep: currentIndex() + 1 })
  }

  const setPreviousStep = () => {
    setStep({ nextStep: currentIndex() - 1, validate: false })
  }

  const stepPlugin = (node) => {
    if (node.props.type == "group") {
      // builds an object of the top-level groups
      steps[node.name] = steps[node.name] || {}
      steps[node.name].node = node;

      // Maintain a default order, can be overwritten to change flow
      if (defaultOrder.length > 0) {
        if (stepOrder.value.length === 0) {
          stepOrder.value = defaultOrder
        }
      } else {
        stepOrder.value.push(node.name)
      }

      node.on('created', () => {
        // use 'on created' to ensure context object is available
        steps[node.name].valid = toRef(node.context.state, 'valid')
      })

      // listen for changes in error count and store it
      node.on('count:errors', ({ payload: count }) => {
        steps[node.name].errorCount = count
      })

      // listen for changes in count of blocking validations messages
      node.on('count:blocking', ({ payload: count }) => {
        steps[node.name].blockingCount = count
      })

      // set the active tab to the 1st tab
      if (activeStep.value === '') {
        activeStep.value = node.name
      }

      // Stop plugin inheritance to descendant nodes
      return false
    }
  }

  return { stepPlugin, steps, stepOrder, defaultOrder, setStepOrder, activeStep, firstStep, lastStep, setStep, setNextStep, setPreviousStep }
}