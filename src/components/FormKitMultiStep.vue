<template>
  <FormKitSchema :schema="schema" :data="mergedData" />
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  data: Object,
  schema: Object
});

const mergedData = reactive(Object.assign({}, dataDefaults, props.data));  // shallow merge
console.debug("FormKitSchema data:", mergedData)
</script>

<script>
import usePrepop from '../usePrepop.js'
import useSteps from '../useSteps.js'
import { postJSON, redirect, flattenObj, strSubUrl } from '../utils.js'

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
  submit: (postUrl, redirectUrl = null, flatten = false) => async (formData, node) => {
    if (flatten) {
      formData = flattenObj(formData)
    }
    try {
      const res = await postJSON(postUrl, formData)
      node.clearErrors()
    } catch (err) {
      console.error(err);
      node.setErrors(err.formErrors, err.fieldErrors)
    }
    if (redirectUrl) {
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