import { reactive, toRef, ref } from 'vue'
import { createMessage } from '@formkit/core'
import { keyValOverlap, getCoords } from './utils.js'

const autoFocusTypes = [
  "email",
  "number",
  "password",
  "search",
  "text",
  "textarea",
  "tel",
  "url"
]

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

  const focusAndOpenKeyboard = (el, timeout) => {
    // Adapted from: https://stackoverflow.com/a/55425845/10682164
    if (!timeout) {
      timeout = 100
    }
    if (el) {
      // Align temp input element approximately where the input element is
      // so the cursor doesn't jump around
      var __tempEl__ = document.createElement('input')
      var coords = getCoords(el)
      __tempEl__.style.position = 'absolute'
      __tempEl__.style.top = (coords.top + 7) + 'px'
      __tempEl__.style.left = coords.left + 'px'
      __tempEl__.style.height = 0
      __tempEl__.style.opacity = 0
      // Put this temp element as a child of the page <body> and focus on it
      document.body.appendChild(__tempEl__)
      __tempEl__.focus()

      // The keyboard is open. Now do a delayed focus on the target element
      setTimeout(function () {
        el.focus()
        el.click()
        document.body.removeChild(__tempEl__)
      }, timeout)
    }
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

  const stepEnabled = (stepName) => {
    return enabledSteps().indexOf(stepName) > -1
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

  const setStep = ({ nextStep = 1, validate = true, autoFocus = true, preStep = null } = {}) => {
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
      if (!node.context) {
        console.warn('No context found for node:', node)
        return false
      }
      if (!node.context.state.valid) {
        return false
      }
    }

    var nextStepsOverride;
    if (preStep) {
      // Next steps can optionally be overridden by a preStep function or
      // the nextStepMap below.
      nextStepsOverride = preStep(node)
    }

    if (!nextStepsOverride && node.props.attrs.nextStepMap) {
      nextStepsOverride = getNextStepsFromMap(node, node.props.attrs.nextStepMap)
    }

    if (nextStepsOverride) {
      setStepQueue([activeStep.value, ...nextStepsOverride])
    }

    // If the step queue is empty we're done (possibly due to dynamic step logic)
    if (stepQueue.value.length === 0) {
      // TODO:
      // Check if we're done with the form and submit it
      return true
    }

    if (typeof (nextStep) === 'number') {
      advanceStep(nextStep)
    } else {
      throw Error("Unexpected value for nextStep: " + nextStep)
    }

    if (autoFocus) {
      // Debounce autofocus
      setTimeout(function () {
        try {
          const newNode = steps[activeStep.value].node
          const firstInput = findFirstInput(newNode)
          if (firstInput && autoFocusTypes.indexOf(firstInput.context.type) > -1) {
            const elem = document.getElementById(firstInput.context.id)
            focusAndOpenKeyboard(elem)
          }
        } catch (e) {
          console.warn('Failed to autoFocus:', e)
        }
      }, 50)
    }

    return true
  }

  const setNextStep = (callback, preStep) => {
    const res = setStep({ nextStep: 1, preStep })
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

      node.on('child', ({ payload: childNode }) => {
        // All 'group' children are assumed to be a step
        if (childNode.type === 'group') {
          if (defaultOrder.length > 0) {
            if (Object.keys(steps).length === 0) {
              setStepQueue(defaultOrder)
            }
          } else {
            if (!stepEnabled(childNode.name)) {
              queueStep(childNode.name)
            }
          }

          // builds an object of the top-level groups
          steps[childNode.name] = {}
          steps[childNode.name].node = childNode;

          // use 'on created' to ensure context object is available
          childNode.on('created', () => {
            steps[childNode.name].valid = toRef(childNode.context.state, 'valid')
          })

          childNode.on('count:errors', ({ payload: count }) => {
            steps[childNode.name].errorCount = count
          })

          // listen for changes in count of blocking validations messages
          childNode.on('count:blocking', ({ payload: count }) => {
            steps[childNode.name].blockingCount = count
          })

          // set the active tab to the 1st tab
          if (activeStep.value === '') {
            activeStep.value = childNode.name
          }
        }
      })
      return true
    }

  }

  return { stepPlugin, steps, stepHistory, stepQueue, enabledSteps, stepEnabled, defaultOrder, activeStep, firstStep, lastStep, setStep, setStepQueue, setNextStep, setPreviousStep }
}