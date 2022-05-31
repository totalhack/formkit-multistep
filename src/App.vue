<template>
  <FormKitMultiStep :schema="schema" :data="data" />
</template>

<script setup>
import { reactive } from 'vue'
import { FormKitMultiStep } from './components/';
import { categoryAndZip, subcategory, contactInfo, formNavigation, formDetails } from './steps.js'

const data = {
  mySubmit: async (formData, node) => {
    console.log("mySubmit")
    alert("Submit override: " + JSON.stringify(formData, null, 2))
  },
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
      // onSubmit: '$submit("https://httpbin.org/post", "https://www.google.com?x=${subid}", true)',
      onSubmit: '$mySubmit',
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
