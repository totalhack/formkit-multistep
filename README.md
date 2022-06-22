# FormKitMultiStep

FormKitMultiStep is a Vue 3 component focused on creating schema-based multi-step forms with FormKit. It grew from discussions and examples in a number of FormKit GitHub issues, so thank
you to that team for the starting point and a great library in FormKit. 

FormKitMultiStep is experimental, rather opinionated, and is subject to rapid changes. Use it at your own discretion. 

Here are some things FormKitMultiStep currently includes:

* Multi-step functionality via useSteps plugin
* Pre-pop functionality via usePrepop plugin, including pre-pop from URL params
* A built-in `$submit` function with:
    * Ability to pass a function to prep form data
    * Control over post-submit redirection with param substitution
* Simple mapping of error codes to messages defined on the form schema (if provided `$submit` is used)
* Use an `inputMap` on the form schema to dynamically control which inputs are enabled based on a key passed to `$inputIsEnabled`
* Map redirect URLs to specific form values via `redirectMap` on the form schema (if provided `$submit` is used)
* Pass additional form-wide metadata in a `type: 'meta'` top-level schema node, use as `$meta.myField`
* Utility to populate schema values from url params: `$urlParam("pitch", "Default text")`


FormKitMultiStep is exported as a component library with vite and available on NPM as `formkit-multistep`. To play around with it, clone this repo and then do the following to bring up App.vue:

```shell
npm install
npm run dev
```
