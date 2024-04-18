<template>
  <FormKitMultiStep :schema="schema" :data="data" />
</template>

<script setup>
import { FormKitMultiStep, buildData, getRedirect, redirectTo, openNewTab } from './components/';
import { categoryAndZip, subcategory, extra, dynamic, contactInfo, formNavigation, formDetails } from './steps.js'
import { dynamicQuestion } from './inputs.js'

let dynamicSchemaLoaded = false;

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
    // return ['contactInfo'];
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
  },
  dynamicStep: dynamic(),
  dynamicInput: dynamicQuestion(),
  loadDynamicSchema: (form, schema) => {
    if (dynamicSchemaLoaded) {
      console.warn('Dynamic schema already loaded')
      // Note: this would be used to avoid reloaded a remote schema
      return schema
    }
    console.log('Load dynamic schema', JSON.stringify(schema, null, 2))
    dynamicSchemaLoaded = true
    return schema
  },
}

const meta = {
  type: 'meta',
  data: {
    someTestField: "Hey you can access this elsewhere as $meta.someTestField",
    subheadline: "Custom meta subheadline!"
  }
}

const schema = [
  meta,
  {
    $cmp: 'FormKit',
    props: {
      type: 'form',
      id: 'form',
      config: { validationVisibility: 'submit' },
      // onSubmit: '$mySubmit',
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
        // Ex: if: '$inputEnabled($get(form), $get(category).value, "favoriteVegetable")',
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
          class: 'form-body',
        },
        children: [
          categoryAndZip({
            nextStepMap: {
              values: {
                'category': {
                  'Vegetables': ['dynamic', 'extra'],
                  'Neither': [],
                },
                '*': ['subcategory']
              },
              appendSteps: ['contactInfo']
            }
          }),
          {
            $cmp: 'FormKitSchema',
            if: '$get(category).value === "Vegetables"',
            props: {
              schema: '$loadDynamicSchema($form, $dynamicStep)',
              data: buildData([meta], data)
            }
          },
          subcategory({
            autoFocus: false
          }),
          extra({
            nextStepMap: {
              values: {
                'extraQuestions.multiCheck': {
                  'Option 1': ['subcategory'],
                  'Option 2': ['subcategory'],
                },
                '*': [],
              },
              matchesAllowed: 2,
              appendSteps: ['contactInfo']
            }
          }),
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
