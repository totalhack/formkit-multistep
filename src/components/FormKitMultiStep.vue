<template>
  <FormKitSchema :schema="schema" :data="mergedData" />
</template>

<script setup>
import { reactive, onMounted } from "vue"
import { getNode } from "@formkit/core"
import { dbg, globalObj } from "../utils.js"

const props = defineProps({
  data: Object,
  schema: Object,
})

const mergedData = reactive(buildData(props.schema, props.data, dataDefaults))

onMounted(() => {
  // NOTE: only a single form per page is supported!
  globalObj.FKMSDataLayer = globalObj.FKMSDataLayer || []

  function processData(data) {
    for (const key in data) {
      const value = data[key]
      const node = getNode(key)
      if (node) {
        if (node.props.options) {
          let found = false
          for (var i = 0; i < node.props.options.length; i++) {
            if (node.props.options[i].value == value) {
              found = true
              break
            }
          }
          if (!found) {
            continue
          }
        }
        dbg("Setting data layer value for:", node.name, value)
        node.input(value)
      }
    }
  }

  for (let i = 0; i < globalObj.FKMSDataLayer.length; i++) {
    const update = globalObj.FKMSDataLayer[i]
    processData(update)
  }

  const originalPush = globalObj.FKMSDataLayer.push
  globalObj.FKMSDataLayer.push = function (...args) {
    for (const update of args) {
      processData(update)
    }
    return originalPush.apply(globalObj.FKMSDataLayer, args)
  }
})
</script>

<script>
import usePrepop from "../usePrepop.js"
import useSteps from "../useSteps.js"
import { postData, strSubUrl, getRedirect, redirectTo, handleSubmitError, getKey, sleep } from "../utils.js"

let { prepopPlugin } = usePrepop()
let {
  stepPlugin,
  steps,
  stepHistory,
  stepQueue,
  enabledSteps,
  stepEnabled,
  activeStep,
  firstStep,
  lastStep,
  setStep,
  setNextStep,
  setPreviousStep,
} = useSteps()

const urlParams = new URLSearchParams(globalObj.location.search)

const dataDefaultsBase = {
  activeStep,
  stepHistory,
  stepQueue,
  plugins: [stepPlugin, prepopPlugin],
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
  setPreviousStep: (callback) => () => {
    return setPreviousStep(callback)
  },
  setStep: (nextStep, validate, autoFocus, preStep) => () => {
    return setStep({ nextStep, validate, autoFocus, preStep })
  },
  stepValid: (stepName) => {
    return steps[stepName].valid && steps[stepName].errorCount === 0
  },
  stepEnabled: (stepName) => {
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
    if (redirectUrl && redirectUrl !== "null") {
      redirectTo(redirectUrl)
    }
  },
  submit:
    (postUrl, prepData = null, redirect = null, contentType = "application/json") =>
    async (formData, node) => {
      if (prepData && prepData != "null") {
        if (!(prepData instanceof Function)) {
          throw "prepData must be a function"
        }
        formData = prepData(formData, node)
      }

      let abort = false
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

      if (typeof redirect === "string" && redirect !== "null") {
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

// NOTE: the steps var causes a cyclical reference if used again in
// a dynamic subschema (using FormKitSchema again).
const dataDefaults = {
  ...dataDefaultsBase,
  steps,
}

export const buildData = (schema, data, defaults = dataDefaultsBase) => {
  const meta = {}
  for (var node of schema) {
    if (!node.type || node.type !== "meta") {
      continue
    }
    Object.assign(meta, node.data || {})
  }
  // shallow merge
  const mergedData = Object.assign({}, defaults, { meta }, data)
  return mergedData
}

export default {}
</script>
