import { reactive, toRef, ref } from 'vue'
import { createMessage } from '@formkit/core'
import { keyValOverlap } from './utils.js'


export default function useSteps() {
  const activeStep = ref('')
  const steps = reactive({})
  let defaultOrder = [];
  let stepQueue = ref([])
  let stepHistory = ref([])

  const lastItem = (x) => {
    return x.value[x.value.length - 1]
  }

  const findFirstInput = (n) => {
    for (var i = 0; i < n.children.length; i++) {
      const child = n.children[i]
      if ((child.type === 'input' || child.type === 'list') && !(child.context.type === 'hidden')) {
        return child
      }
      const res = findFirstInput(child)
      if (res) {
        return res
      }
    }
    return null
  }

  const firstStep = () => {
    if (stepHistory.value.length > 0) {
      return stepHistory.value[0]
    }
    return stepQueue.value[0]
  }

  const lastStep = () => {
    if (stepQueue.value.length > 0) {
      return lastItem(stepQueue)
    }
    return lastItem(stepHistory)
  }

  const enabledSteps = () => {
    return [...stepHistory.value, ...stepQueue.value]
  }

  const setStepQueue = (value) => {
    stepQueue.value = [...value]
  }

  const queueStep = (stepName, next = false) => {
    if (next == true) {
      stepQueue.value.unshift(stepName)
    } else {
      stepQueue.value.push(stepName)
    }
  }

  const advanceStep = (stepCount) => {
    if (stepCount == 1) {
      const done = stepQueue.value.shift()
      stepHistory.value.push(done)
      activeStep.value = stepQueue.value[0]
    } else if (stepCount == -1) {
      const undone = stepHistory.value.pop()
      queueStep(undone, true)
      activeStep.value = undone
    } else {
      throw Error('Invalid stepCount: ' + JSON.stringify(stepCount))
    }
  }

  const getNextStepsFromMap = (node, nextStepMap) => {
    return keyValOverlap(node.value, nextStepMap)
  }

  const setStep = ({ nextStep = 1, validate = true, autoFocus = true } = {}) => {
    const node = steps[activeStep.value].node

    if (validate) {
      node.walk((n) => {
        n.store.set(
          createMessage({
            key: 'submitted',
            value: true,
            visible: false
          })
        )
      })
      if (!node.context.state.valid) {
        return false
      }
    }

    if (node.props.attrs.nextStepMap) {
      const nextSteps = getNextStepsFromMap(node, node.props.attrs.nextStepMap)
      if (nextSteps) {
        setStepQueue([activeStep.value, ...nextSteps])
      }
    }

    if (typeof (nextStep) === 'number') {
      advanceStep(nextStep)
    } else {
      throw Error("Unexpected value for nextStep: " + nextStep)
    }

    if (autoFocus) {
      const newNode = steps[activeStep.value].node
      setTimeout(function () {
        const firstInput = findFirstInput(newNode)
        if (!firstInput) {
          return
        }
        const elem = document.getElementById(firstInput.context.id)
        elem.focus()
      }, 400);
    }

    return true
  }

  const setNextStep = (callback) => {
    const res = setStep({ nextStep: 1 })
    if (callback) {
      callback(res, stepHistory, stepQueue)
    }
    return res
  }

  const setPreviousStep = (callback) => {
    const res = setStep({ nextStep: -1, validate: false })
    if (callback) {
      callback(res, stepHistory, stepQueue)
    }
    return res
  }

  const stepPlugin = (node) => {
    if (node.props.type == "form") {
      if (node.props.attrs.defaultOrder) {
        defaultOrder.push(...node.props.attrs.defaultOrder)
      }
      return true
    }

    if (node.props.type == "group") {
      // Maintain a default order, can be overwritten to change flow
      if (defaultOrder.length > 0) {
        if (Object.keys(steps).length === 0) {
          setStepQueue(defaultOrder)
        }
      } else {
        if (!(node.name in steps)) { // Make sure not called on node reinit
          queueStep(node.name)
        }
      }

      // builds an object of the top-level groups
      steps[node.name] = steps[node.name] || {}
      steps[node.name].node = node;

      // use 'on created' to ensure context object is available
      node.on('created', () => {
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

  return { stepPlugin, steps, stepHistory, stepQueue, enabledSteps, defaultOrder, activeStep, firstStep, lastStep, setStep, setStepQueue, setNextStep, setPreviousStep }
}