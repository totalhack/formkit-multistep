export const category = () => ({
  $formkit: 'select',
  label: 'Category',
  name: 'category',
  id: 'category',
  validation: 'required',
  options: [
    'Fruits',
    'Vegetables'
  ]
})

export const favoriteFruit = () => ({
  $formkit: 'select',
  label: 'Favorite Fruit',
  name: 'favoriteFruit',
  validation: 'required',
  options: [
    'Apples',
    'Bananas',
    'Mango'
  ]
})

export const favoriteVegetable = () => ({
  $formkit: 'select',
  label: 'Favorite Vegetable',
  name: 'favoriteVegetable',
  validation: 'required',
  options: [
    'Broccoli',
    'Corn',
    'Carrots'
  ]
})

export const fruitQuestions = () => ({
  $formkit: 'group',
  id: 'fruitQuestions',
  name: 'fruitQuestions',
  if: '$get(category).value == "Fruits"',
  children: [favoriteFruit()]
})

export const vegetableQuestions = () => ({
  $formkit: 'group',
  id: 'vegetableQuestions',
  name: 'vegetableQuestions',
  if: '$get(category).value == "Vegetables"',
  children: [favoriteVegetable()]
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

