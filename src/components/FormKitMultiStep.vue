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
</script>

<script>
import usePrepop from '../usePrepop.js'
import useSteps from '../useSteps.js'
import { postData, strSubUrl, getRedirect, redirectTo, handleSubmitError, getKey } from '../utils.js'

let { prepopPlugin } = usePrepop()
let { stepPlugin, steps, stepHistory, stepQueue, enabledSteps, defaultOrder, activeStep, firstStep, lastStep, setStep, setNextStep, setPreviousStep } = useSteps()
const urlParams = new URLSearchParams(window.location.search);

const dataDefaults = {
  steps,
  activeStep,
  stepHistory,
  stepQueue,
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
  setNextStep: (callback, preStep) => () => {
    return setNextStep(callback, preStep)
  },
  setPreviousStep: callback => () => {
    return setPreviousStep(callback)
  },
  setStep: (nextStep, validate, autoFocus, preStep) => () => {
    return setStep({ nextStep, validate, autoFocus, preStep })
  },
  stepIsValid: stepName => {
    return steps[stepName].valid && steps[stepName].errorCount === 0
  },
  stepIsEnabled: stepName => {
    if (!enabledSteps().length) {
      // HACK: assume it's init time and always return true
      return true
    }
    return enabledSteps().indexOf(stepName) > -1
  },
  getKey: (d, k, def) => {
    return getKey(d, k, def)
  },
  inputIsEnabled: (node, key, inputName) => {
    if (!node || !key || !node.attrs.inputMap) {
      return true
    }
    if (!(key in node.attrs.inputMap)) {
      return false
    }
    if (node.attrs.inputMap[key].indexOf(inputName) < 0) {
      return false
    }
    return true
  },
  handleRedirectMap: (formData, node) => {
    const redirectUrl = getRedirect(formData, node)
    if (redirectUrl && redirectUrl !== 'null') {
      redirectTo(redirectUrl)
    }
  },
  submit: (postUrl, prepData = null, redirect = null, contentType = 'application/json') => async (formData, node) => {
    if (prepData && prepData != 'null') {
      if (!(prepData instanceof Function)) {
        throw 'prepData must be a function'
      }
      formData = prepData(formData)
    }

    let abort = false;
    try {
      const res = await postData(postUrl, formData, contentType)
      node.clearErrors()
    } catch (err) {
      console.error(err)
      abort = handleSubmitError(err, node)
    }

    if (abort) {
      return
    }

    if (typeof redirect === 'string' && redirect !== 'null') {
      if (formData) {
        redirect = strSubUrl(redirect, formData)
      }
      redirectTo(redirect)
    } else if (redirect) {
      // Assume it's a function that handles the redirect
      await redirect(formData, node)
    }
  },
  stringify: (value) => JSON.stringify(value, null, 2),
}

export default {}
</script>