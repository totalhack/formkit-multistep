import { dbg } from "./utils.js"

export default function usePrepop() {
  let prepopSettings = {}
  const urlParams = new URLSearchParams(globalThis.location.search)

  const prepopPlugin = (node) => {
    if (node.props.type == "form") {
      prepopSettings = node.props.attrs.prepop || prepopSettings
      return true
    }

    if (node.props.type == "group") {
      return true
    }

    if (prepopSettings) {
      let value

      if (prepopSettings.values) {
        value = prepopSettings.values[node.name]
      }

      if (prepopSettings.fromURL && urlParams.has(node.name)) {
        value = urlParams.get(node.name)
      }

      if (value) {
        if (node.props.options) {
          let found = false
          for (var i = 0; i < node.props.options.length; i++) {
            if (node.props.options[i].value == value) {
              found = true
              break
            }
          }
          if (!found) {
            dbg("Prepop option not found for:", node.name, value)
            return
          }
        }

        dbg("Setting prepop value for:", node.name, value)
        node.input(value)
      }
    }
  }

  return { prepopPlugin, prepopSettings }
}
