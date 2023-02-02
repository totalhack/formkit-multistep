<template>
  <FormKitMultiStep :schema="schema" :data="data" />
</template>

<script setup>
import { reactive } from 'vue'
import { FormKitMultiStep, getRedirect, redirectTo, openNewTab } from './components/';
import { categoryAndZip, subcategory, contactInfo, formNavigation, formDetails } from './steps.js'

const flattenObj = (obj) => {
  const flattened = {}

  Object.keys(obj).forEach((key) => {
    const value = obj[key]

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObj(value))
    } else {
      flattened[key] = value
    }
  })

  return flattened
}

const data = {
  mySubmit: async (formData, node) => {
    console.log("mySubmit")
    alert("Submit override: " + JSON.stringify(formData, null, 2))
  },
  flattenObj: flattenObj,
  prepop: {
    fromURL: true,
    values: {
      zip_code: "12345",
    }
  },
  nextStepCallback: (stepResult, stepHistory, stepQueue) => {
    console.log('nextStepCallback:', stepResult, stepHistory.value, stepQueue.value)
  },
  preStepFunc: (stepNode) => {
    console.log('preStepFunc:', stepNode)
  },
  handleRedirectNewTab: (formData, node) => {
    var redirectUrl = getRedirect(formData, node)
    if (redirectUrl && redirectUrl !== 'null') {
      const res = openNewTab(redirectUrl)
      if (res !== null) {
        redirectTo('https://www.google.com?oldtab=1')
      } else {
        console.warn('new tab failed')
        redirectTo(redirectUrl)
      }
    }
  }
}

const schema = [
  {
    type: 'meta',
    data: {
      someTestField: "Hey you can access this elsewhere as $meta.someTestField",
      subheadline: "Custom meta subheadline!"
    }
  },
  {
    $cmp: 'FormKit',
    props: {
      type: 'form',
      id: 'form',
      config: { validationVisibility: 'submit' },
      // onSubmit: '$submit("https://httpbin.org/post", $flattenObj, $handleRedirectNewTab)',
      onSubmit: '$submit("https://httpbin.org/post", $flattenObj, $handleRedirectMap, "text/plain; charset=UTF-8")',
      // onSubmit: '$submit("https://httpbingo.org/redirect-to?url=https://www.google.com", $flattenObj)',
      // onSubmit: '$submit("http://localhost:8080/api/v1/redirect", $flattenObj)',
      // onSubmit: '$submit("https://httpbin.org/post", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$submit("https://httpbin.org/status/403", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$submit("https://httpbin.org/status/409", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$submit("https://httpbin.org/status/429", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$submit("https://httpbin.org/status/500", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$submit("https://httpbin.org/status/504", $flattenObj, "https://www.google.com?x=${subid}")',
      // onSubmit: '$mySubmit',
      plugins: '$plugins',
      actions: false,
      prepop: '$prepop',
      errorCodes: {
        403: { message: "An Error Occurred - Forbidden", abort: false },
        409: { abort: false },
        429: "An Error Occurred - Rate Limit Exceeded",
        504: { message: "An Error Occurred - Timeout", abort: false },
      },
      inputMap: {
        // Can be used to dynamically control inputs by some key
        // Ex: if: '$inputIsEnabled($get(form), $get(category).value, "favoriteVegetable")',
        'Fruits': ['favoriteFruit'],
        'Vegetables': ['favoriteVegetable']
      },
      redirectMap: {
        'category': {
          'Neither': 'https://www.google.com?x=${subid}&y=1',
          'Vegetables': 'https://www.google.com?x=${subid}&y=2',
        },
        '*': null
      }
    },
    children: [
      {
        $el: 'h1',
        children: '$urlParam("pitch", "Need Help") + "? Start Here!"',
        attrs: {
          class: 'text-center text-3xl font-bold'
        }
      },
      {
        $el: 'h3',
        children: '$getKey($meta, "subheadline", "Get Your Questions Answered Today!")',
        attrs: {
          class: 'text-center text-l font-bold text-blue-500'
        }
      },
      {
        $formkit: 'hidden',
        name: "subid",
        value: "1234"
      },
      {
        $el: 'div',
        attrs: {
          class: 'form-body'
        },
        children: [
          categoryAndZip({
            nextStepMap: {
              'category': {
                'Neither': ['contactInfo'],
              },
              '*': ['subcategory', 'contactInfo']
            }
          }),
          subcategory(),
          contactInfo(),
          formNavigation(),
          formDetails(),
        ]
      },
    ]
  }
]
console.log("Schema:", JSON.stringify(schema, null, 2))
</script>
