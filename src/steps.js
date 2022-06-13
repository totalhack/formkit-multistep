import { merge } from './utils.js';
import * as inp from './inputs.js';

const stepDefaults = (step) => ({
  $el: 'section',
  if: '$stepIsEnabled("' + step + '")',
  attrs: {
    style: {
      if: '$activeStep !== "' + step + '"',
      then: 'display: none;'
    }
  }
})

function step(name, inputs, ...args) {
  return merge(
    stepDefaults(name),
    {
      children: [
        {
          $formkit: 'group',
          id: name,
          name: name,
          children: inputs
        }
      ],
    },
    ...args
  )
}

export function categoryAndZip() {
  return step(
    'categoryAndZip',
    [
      inp.zipcode(),
      inp.category(),
    ],
    ...arguments
  )
}


export function subcategory() {
  return step(
    'subcategory',
    [
      inp.fruitQuestions(),
      inp.vegetableQuestions()
    ],
    ...arguments
  )
}

export function contactInfo() {
  return step(
    'contactInfo',
    [
      inp.email(),
      inp.phone(),
      inp.consent()
    ],
    ...arguments
  )
}

export const formNavigation = () => ({
  $el: 'div',
  attrs: {
    class: 'step-nav'
  },
  children: [
    {
      $formkit: 'button',
      onClick: '$setPreviousStep()',
      children: 'Previous Step',
      style: {
        if: '$activeStep === $firstStep()',
        then: 'visibility: hidden;'
      }
    },
    {
      $formkit: 'button',
      onClick: '$setNextStep()',
      children: 'Next Step',
      style: {
        if: '$activeStep === $lastStep()',
        then: 'display: none;'
      }
    },
    {
      $formkit: 'submit',
      label: 'Submit Application',
      if: '$activeStep === $lastStep()',
      style: {
        if: '$activeStep !== $lastStep()',
        then: 'display: none;'
      }
    }
  ]
})

export const formDetails = () => ({
  $el: 'pre',
  children: [
    {
      $el: 'pre',
      children: '$stringify( $get(form).value )',
      attrs: {
        class: 'text-xs',
        style: 'overflow: scroll'
      }
    },
    {
      $el: 'pre',
      children: ['activeStep: ', '$activeStep'],
      attrs: {
        class: 'text-xs',
        style: 'overflow: scroll'
      }
    },
    {
      $el: 'pre',
      children: ['stepOrder: ', '$stepOrder'],
      attrs: {
        class: 'text-xs',
        style: 'overflow: scroll'
      }
    }
  ]
})

