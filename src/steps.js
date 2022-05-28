
import { email, phone, date, zipcode, consent } from './inputs'


const dateAndZip = () => ({
  $el: 'section',
  if: '$stepIsEnabled("dateAndZip")',
  attrs: {
    style: {
      if: '$activeStep !== "dateAndZip"',
      then: 'display: none;'
    }
  },
  children: [
    {
      $formkit: 'group',
      id: 'dateAndZip',
      name: 'dateAndZip',
      children: [
        zipcode(),
        date(),
      ]
    }
  ]
})

const contactInfo = () => ({
  $el: 'section',
  if: '$stepIsEnabled("contactInfo")',
  attrs: {
    style: {
      if: '$activeStep !== "contactInfo"',
      then: 'display: none;'
    }
  },
  children: [
    {
      $formkit: 'group',
      id: 'contactInfo',
      name: 'contactInfo',
      children: [
        email(),
        phone(),
        consent()
      ]
    }
  ]
})

const formNavigation = () => ({
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

const formDetails = () => ({
  $el: 'pre',
  children: [
    {
      $el: 'pre',
      children: '$stringify( $get(form).value )'
    },
    {
      $el: 'pre',
      children: ['activeStep: ', '$activeStep']
    },
    {
      $el: 'pre',
      children: ['stepOrder: ', '$stepOrder']
    }
  ]
})

export { contactInfo, formNavigation, formDetails, dateAndZip }
