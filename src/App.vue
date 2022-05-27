<template>
  <FormKitMultiStep :schema="schema" :data="data" />
</template>

<script setup>
import { reactive } from 'vue'
import { FormKitMultiStep } from './components/';
import { dateAndZip, contactInfo, formNavigation, formDetails } from './steps.js'

const data = {
  mySubmit: async (formData, node) => {
    console.log("mySubmit")
    alert("Submit override: " + JSON.stringify(formData, null, 2))
  },
  prepop: {
    zip_code: "12345",
    date: "2022-05-01"
  }
}

const schema = [
  {
    $cmp: 'FormKit',
    props: {
      type: 'form',
      id: 'form',
      onSubmit: '$submit("https://httpbin.org/post")',
      // onSubmit: '$submit("https://httpbin.org/post", "https://www.google.com?x=${subid}")',
      // onSubmit: '$mySubmit',
      plugins: '$plugins',
      actions: false,
      prepop: '$prepop',
      defaultOrder: ['dateAndZip']
    },
    children: [
      {
        $el: 'h1',
        children: 'Need Help? Start Here!',
        attrs: {
          class: 'flex justify-center text-3xl font-bold'
        }
      },
      {
        $el: 'h3',
        children: 'Get Your Questions Answered Today!',
        attrs: {
          class: 'flex justify-center text-l font-bold text-blue-500'
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
          dateAndZip(),
          contactInfo(),
          formNavigation(),
          formDetails(),
        ]
      },
    ]
  }
]
</script>
