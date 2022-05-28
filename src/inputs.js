const email = () => ({
  $formkit: 'email',
  name: 'email',
  label: 'Email address',
  placeholder: 'email@domain.com',
  validation: 'required|email'
})

const phone = () => ({
  $formkit: 'tel',
  name: 'tel',
  label: 'Telephone',
  placeholder: 'xxx-xxx-xxxx',
  help: '10-digit US phone number, hyphens optional.',
  validation: 'required|matches:/^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/'
})

const date = () => ({
  $formkit: 'date',
  label: 'Date',
  name: 'date',
  validation: 'required'
})

const zipcode = () => ({
  $formkit: 'text',
  label: 'Zip Code',
  placeholder: '90210',
  name: 'zip_code',
  validation: 'required|matches:/^[0-9]{5}$/'
})

const consent = () => ({
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

export { email, phone, date, zipcode, consent }
