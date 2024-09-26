import { extra } from "./steps.js";
import { merge } from "./utils.js";

// ------ Common Base Settings

const yesnoradio = (updates) => {
  return merge(
    {
      $formkit: "radio",
      validation: "required",
      validationMessages: {
        required: "Field is required",
      },
      optionsClass: "pt-3 pl-1",
      options: ["Yes", "No"],
    },
    updates
  );
};

const select = (updates) => {
  return merge(
    {
      $formkit: "select",
      placeholder: "Please Select",
      validation: "required",
      validationMessages: {
        required: "Field is required",
      },
    },
    updates
  );
};

// ------ Inputs

export const category = () =>
  select({
    label: "Category",
    name: "category",
    id: "category",
    options: ["Fruits", "Vegetables", "Neither"],
  });

export const pickyEater = () =>
  yesnoradio({
    name: "pickyEater",
    id: "pickyEater",
    label: "Are You a Picky Eater?",
  });

export const foodSource = () =>
  select({
    label: "How Do You Source Your Food?",
    name: "foodSource",
    options: ["Grow", "Buy", "Replicator"],
  });

export const favoriteFruit = () =>
  select({
    label: "Favorite Fruit",
    name: "favoriteFruit",
    id: "favoriteFruit",
    // if: '$inputEnabled($get(form), $get(category).value, "favoriteFruit")',
    options: ["Apples", "Bananas", "Mango"],
  });

export const favoriteVegetable = () =>
  select({
    label: "Favorite Vegetable",
    name: "favoriteVegetable",
    id: "favoriteVegetable",
    // if: '$inputEnabled($get(form), $get(category).value, "favoriteVegetable")',
    options: ["Broccoli", "Corn", "Carrots"],
  });

export const consent = () => ({
  $formkit: "checkbox",
  label: "By checking this box, I agree to the Terms of Use.",
  name: "consent",
  validation: "required|accepted",
  validationMessages: {
    accepted: "You must agree!",
  },
  classes: {
    label: "text-xs text-slate-500",
  },
});

export const date = () => ({
  $formkit: "date",
  label: "Date",
  name: "date",
  validation: "required",
});

export const email = () => ({
  $formkit: "email",
  name: "email",
  label: "Email address",
  placeholder: "email@domain.com",
  validation: "required|email",
});

export const phone = () => ({
  $formkit: "tel",
  name: "phone",
  label: "Telephone",
  placeholder: "xxx-xxx-xxxx",
  help: "10-digit US phone number, hyphens optional.",
  validation: "required|matches:/^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/",
});

export const zipcode = () => ({
  $formkit: "text",
  name: "zip_code",
  id: "zip_code",
  label: "Zip Code",
  placeholder: "90210",
  maxlength: 5,
  inputmode: "numeric",
  validation: "required|matches:/^[0-9]{5}$/",
});

export const hidden = () => ({
  $formkit: "hidden",
  name: "hidden",
  value: null,
});

export const multiCheck = () => ({
  $formkit: "checkbox",
  label: "Here is a multi-select check box",
  name: "multiCheck",
  validation: "required",
  options: ["Option 1", "Option 2", "Option 3"],
});

// ------ Question Groups

// NOTE: name must be unique!
const group = (name, updates) => {
  return merge(
    {
      $cmp: "FormKit",
      props: {
        type: "group",
        key: name,
        id: name,
        name: name,
      },
    },
    updates
  );
};

export const fruitQuestions = () =>
  group("fruitQuestions", {
    if: '$get(category).value == "Fruits"',
    children: [
      hidden(),
      pickyEater(),
      favoriteFruit(),
      foodSource(),
      // Test dynamically adding schema as an input
      {
        $cmp: "FormKitSchema",
        if: '$get(pickyEater).value === "Yes"',
        props: {
          schema: "$loadDynamicSchema($form, $dynamicInput)",
        },
      },
    ],
  });

export const vegetableQuestions = () =>
  group("vegetableQuestions", {
    if: '$get(category).value == "Vegetables"',
    children: [favoriteVegetable(), pickyEater(), foodSource()],
  });

export const extraQuestions = () =>
  group("extraQuestions", {
    if: '$get(category).value == "Vegetables"',
    children: [date(), multiCheck()],
  });

export const dynamicQuestion = () =>
  yesnoradio({
    name: "dynamic",
    label: "Dynamic Question Ay?",
  });

export const dynamicQuestions = () =>
  group("dynamicQuestions", {
    children: [dynamicQuestion()],
  });
