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
</script>

<script>
import useSteps from '../useSteps.js'
import { postJSON, redirect, strSubUrl } from '../utils.js'

let { stepPlugin, steps, stepOrder, defaultOrder, setStepOrder, activeStep, firstStep, lastStep, setStep, setNextStep, setPreviousStep } = useSteps()

const dataDefaults = {
  steps,
  stepOrder,
  activeStep,
  plugins: [
    stepPlugin
  ],
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
    console.log("setStep:", nextStep, validate)
    setStep({ nextStep, validate })
  },
  setStepOrder: target => () => {
    setStepOrder(target)
  },
  redirect: target => () => {
    console.log("Calling redirect with url " + target)
    redirect('https://www.google.com')
  },
  log: target => () => {
    console.log('target:', target)
  },
  stepIsValid: stepName => {
    return steps[stepName].valid && steps[stepName].errorCount === 0
  },
  stepIsEnabled: stepName => {
    return stepOrder.value.indexOf(stepName) > -1
  },
  submit: (postUrl, redirectUrl = null) => async (formData, node) => {
    try {
      const res = await postJSON(postUrl, formData)
      node.clearErrors()
      alert('Submitted successfully!')
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