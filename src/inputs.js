import { merge } from './utils.js';

// ------ Common Base Settings

const yesnoradio = (updates) => {
  return merge({
    $formkit: 'radio',
    validation: 'required',
    validationMessages: {
      required: 'Field is required',
    },
    optionsClass: 'pt-3 pl-1',
    options: [
      'Yes',
      'No'
    ]
  }, updates)
}

const select = (updates) => {
  return merge({
    $formkit: 'select',
    placeholder: "Please Select",
    validation: 'required',
    validationMessages: {
      required: 'Field is required',
    },
  }, updates)
}

// ------ Inputs

export const category = () => select({
  label: 'Category',
  name: 'category',
  id: 'category',
  options: [
    'Fruits',
    'Vegetables'
  ]
})

export const pickyEater = () => yesnoradio({
  name: 'picky_eater',
  label: 'Are You a Picky Eater?',
})

export const foodSource = () => select({
  label: 'How Do You Source Your Food?',
  name: 'foodSource',
  options: [
    'Grow',
    'Buy',
    'Replicator'
  ]
})

export const favoriteFruit = () => select({
  label: 'Favorite Fruit',
  name: 'favoriteFruit',
  if: '$inputIsEnabled($get(form), $get(category).value, "favoriteFruit")',
  options: [
    'Apples',
    'Bananas',
    'Mango'
  ]
})

export const favoriteVegetable = () => select({
  label: 'Favorite Vegetable',
  name: 'favoriteVegetable',
  if: '$inputIsEnabled($get(form), $get(category).value, "favoriteVegetable")',
  options: [
    'Broccoli',
    'Corn',
    'Carrots'
  ]
})

export const consent = () => ({
  $formkit: 'checkbox',
  label: 'By checking this box, I agree to the Terms of Use.',
  name: 'consent',
  validation: 'required|accepted',
  validationMessages: {
    accepted: 'You must agree!',
  },
  classes: {
    label: "text-xs text-slate-500"
  }
})

export const date = () => ({
  $formkit: 'date',
  label: 'Date',
  name: 'date',
  validation: 'required'
})

export const email = () => ({
  $formkit: 'email',
  name: 'email',
  label: 'Email address',
  placeholder: 'email@domain.com',
  validation: 'required|email'
})

export const phone = () => ({
  $formkit: 'tel',
  name: 'phone',
  label: 'Telephone',
  placeholder: 'xxx-xxx-xxxx',
  help: '10-digit US phone number, hyphens optional.',
  validation: 'required|matches:/^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/'
})

export const zipcode = () => ({
  $formkit: 'text',
  label: 'Zip Code',
  placeholder: '90210',
  name: 'zip_code',
  validation: 'required|matches:/^[0-9]{5}$/'
})

// ------ Question Groups

export const fruitQuestions = () => ({
  $formkit: 'group',
  id: 'fruitQuestions',
  name: 'fruitQuestions',
  if: '$get(category).value == "Fruits"',
  children: [pickyEater(), favoriteFruit(), foodSource()]
})

export const vegetableQuestions = () => ({
  $formkit: 'group',
  id: 'vegetableQuestions',
  name: 'vegetableQuestions',
  if: '$get(category).value == "Vegetables"',
  children: [pickyEater(), favoriteVegetable(), foodSource()]
})