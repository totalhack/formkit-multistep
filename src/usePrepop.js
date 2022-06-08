export default function usePrepop() {
  let prepopSettings = {}
  const urlParams = new URLSearchParams(window.location.search);

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
        console.debug('Setting prepop value for:', node.name, value)
        node.input(value)
      }
    }
  }

  return { prepopPlugin, prepopSettings }
}