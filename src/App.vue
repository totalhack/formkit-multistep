<template>
  <FormKitMultiStep :schema="schema" :data="data" />
</template>

<script setup>
import { reactive } from 'vue'
import { FormKitMultiStep } from './components/';
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
  }
}

const schema = [
  {
    $cmp: 'FormKit',
    props: {
      type: 'form',
      id: 'form',
      // onSubmit: '$submit("https://httpbin.org/post", $flattenObj, "https://www.google.com?x=${subid}")',
      onSubmit: '$submit("https://httpbin.org/post", $flattenObj)',
      // onSubmit: '$submit("https://httpbin.org/status/500", $flattenObj)',
      // onSubmit: '$mySubmit',
      plugins: '$plugins',
      actions: false,
      prepop: '$prepop',
      // defaultOrder: ['categoryAndZip']
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
        children: 'Get Your Questions Answered Today!',
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
          categoryAndZip(),
          subcategory(),
          contactInfo(),
          formNavigation(),
          formDetails(),
        ]
      },
    ]
  }
]
</script>
