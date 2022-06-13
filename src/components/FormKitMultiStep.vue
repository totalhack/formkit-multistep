<template>
  <FormKitSchema :schema="schema" :data="mergedData" />
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  data: Object,
  schema: Object
});

const meta = {}
for (var node of props.schema) {
  if (!node.type || node.type !== 'meta') {
    continue
  }
  Object.assign(meta, node.data || {})
}

// shallow merge
const mergedData = reactive(Object.assign({}, dataDefaults, { meta }, props.data));
console.debug("FormKitSchema data:", mergedData)
</script>

<script>
import usePrepop from '../usePrepop.js'
import useSteps from '../useSteps.js'
import { postJSON, redirect, strSubUrl, handleSubmitError } from '../utils.js'

let { prepopPlugin } = usePrepop()
let { stepPlugin, steps, stepOrder, defaultOrder, setStepOrder, activeStep, firstStep, lastStep, setStep, setNextStep, setPreviousStep } = useSteps()
const urlParams = new URLSearchParams(window.location.search);

const dataDefaults = {
  steps,
  stepOrder,
  activeStep,
  plugins: [
    stepPlugin,
    prepopPlugin,
  ],
  urlParam: (name, backup = null) => {
    return urlParams.get(name) || backup
  },
  firstStep: () => {
    return firstStep()
  },
  lastStep: () => {
    return lastStep()
  },
  setNextStep: target => () => {
    setNextStep()
  },
  setPreviousStep: target => () => {
    setPreviousStep()
  },
  setStep: (nextStep, validate) => () => {
    setStep({ nextStep, validate })
  },
  setStepOrder: target => () => {
    setStepOrder(target)
  },
  stepIsValid: stepName => {
    return steps[stepName].valid && steps[stepName].errorCount === 0
  },
  stepIsEnabled: stepName => {
    if (!stepOrder.value.length) {
      // HACK: assume it's init time and always return true
      return true
    }
    return stepOrder.value.indexOf(stepName) > -1
  },
  inputIsEnabled: (node, key, inputName) => {
    if (!node || !key || !node.attrs.inputMap) {
      return true
    }
    const inputMap = node.attrs.inputMap
    if (inputMap[key].indexOf(inputName) < 0) {
      return false
    }
    return true
  },
  submit: (postUrl, prepData = null, redirectUrl = null) => async (formData, node) => {
    if (prepData && prepData != 'null') {
      if (!(prepData instanceof Function)) {
        throw 'prepData must be a function'
      }
      formData = prepData(formData)
    }
    let abort = false;
    try {
      const res = await postJSON(postUrl, formData)
      node.clearErrors()
    } catch (err) {
      abort = handleSubmitError(err, formData, node)
    }

    if (abort) {
      return
    }

    if (redirectUrl && redirectUrl !== 'null') {
      if (formData) {
        redirectUrl = strSubUrl(redirectUrl, formData)
      }
      redirect(redirectUrl)
    }
  },
  stringify: (value) => JSON.stringify(value, null, 2),
}

export default {}
</script>