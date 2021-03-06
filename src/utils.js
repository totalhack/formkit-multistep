export const postJSON = async (url, data) => {
  console.debug("Posting to " + url)
  const raw = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!raw.ok) {
    let error = new Error(raw.statusText);
    Object.assign(error, { response: raw })
    throw error
  }
  const res = await raw.json();
  console.debug("POST response:" + JSON.stringify(res, null, 2));
  return res
}

export const redirect = (url) => {
  // similar behavior as clicking on a link, maintains back button
  window.location.href = url
}

export const handleSubmitError = (err, node) => {
  if (err.response) {
    const code = err.response.status;
    if (node.props.attrs.errorCodes && code in node.props.attrs.errorCodes) {
      const value = node.props.attrs.errorCodes[code]
      let message = null
      let abort = true

      if (typeof (value) === 'string') {
        message = value
      } else {
        if ('message' in value) {
          message = value.message
        }
        if ('abort' in value) {
          abort = value.abort
        }
      }

      if (message) {
        node.setErrors(message)
      }
      return abort
    }
  }
  node.setErrors(err.toString())
  return true // abort by default
}

export const getKey = (d, path) => {
  if (typeof (path) === 'string') {
    path = path.split('.')
  }
  return path.reduce((x, y) => x[y], d)
}

// Helper to map an input object key/val over a value map
export const keyValOverlap = (o1, o2) => {
  let result = null;

  for (var key of Object.keys(o2)) {
    if (key === '*') {
      continue
    }
    const o1_value = getKey(o1, key)
    if (!o1_value) {
      continue
    }

    if (o2[key][o1_value]) {
      result = o2[key][o1_value];
      break
    }
  }

  if (result === null) {
    if ('*' in o2) {
      return o2['*'] // '*' is special placeholder for defaults
    }
    throw Error('result not found and no default specified')
  }
  return result
}

export const strSub = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => getKey(obj, g));

export const strSubUrl = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => encodeURIComponent(getKey(obj, g)));

export function merge() {
  return Object.assign({}, ...arguments)
}