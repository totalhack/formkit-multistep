<template>
  <FormKitSchema :schema="schema" :data="mergedData" />
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  data: Object,
  schema: Object
});

const mergedData = reactive(buildData(props.schema, props.data, dataDefaults))
</script>

<script>
import usePrepop from '../usePrepop.js'
import useSteps from '../useSteps.js'
import { postData, strSubUrl, getRedirect, redirectTo, handleSubmitError, getKey, sleep } from '../utils.js'

let { prepopPlugin } = usePrepop()
let { stepPlugin, steps, stepHistory, stepQueue, enabledSteps, stepEnabled, defaultOrder, activeStep, firstStep, lastStep, setStep, setNextStep, setPreviousStep } = useSteps()
const urlParams = new URLSearchParams(window.location.search);

const dataDefaultsBase = {
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
  stepKeys: () => {
    return Object.keys(steps)
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
  stepValid: stepName => {
    return steps[stepName].valid && steps[stepName].errorCount === 0
  },
  stepEnabled: stepName => {
    if (!enabledSteps().length) {
      // HACK: assume it's init time and always return true
      return true
    }
    return stepEnabled(stepName)
  },
  getKey: (d, k, def) => {
    return getKey(d, k, def)
  },
  inputEnabled: (node, key, inputName) => {
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
      // Keep spinner active longer while we redirect
      await sleep(2000)
    } else if (redirect) {
      // Assume it's a function that handles the redirect
      redirect(formData, node)
      await sleep(2000)
    }
  },
  stringify: (value) => JSON.stringify(value, null, 2),
}

// NOTE: the steps var causes a cyclical reference if used in again in
// a dynamic subschema (using FormKitSchema again).
const dataDefaults = {
  ...dataDefaultsBase,
  steps,
}

export const buildData = (schema, data, defaults = dataDefaultsBase) => {
  const meta = {}
  for (var node of schema) {
    if (!node.type || node.type !== 'meta') {
      continue
    }
    Object.assign(meta, node.data || {})
  }
  // shallow merge
  const mergedData = Object.assign({}, defaults, { meta }, data);
  return mergedData
}

export default {}
</script>