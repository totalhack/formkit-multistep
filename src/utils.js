const urlParams = new URLSearchParams(window.location.search);
const DEBUG = urlParams.get('fdbg')

export function dbg() {
  if (DEBUG != 1) return
  console.debug(...arguments)
}

export const sleep = async (time) => {
  return new Promise(resolve => setTimeout(resolve, time));
}

export const getCoords = (elem) => {
  let box = elem.getBoundingClientRect()
  return {
    top: box.top + window.pageYOffset,
    right: box.right + window.pageXOffset,
    bottom: box.bottom + window.pageYOffset,
    left: box.left + window.pageXOffset
  }
}

export const postData = async (url, data, contentType = 'application/json') => {
  dbg("Post to: " + url)
  const raw = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': contentType
    },
    body: JSON.stringify(data)
  });
  if (!raw.ok) {
    let error = new Error(raw.statusText);
    Object.assign(error, { response: raw })
    throw error
  }
  const res = await raw.json();
  dbg("Post resp: " + JSON.stringify(res, null, 2));
  return res
}

export const redirectTo = (url) => {
  // similar behavior as clicking on a link, maintains back button
  window.location = url
}

export const openNewTab = (url) => {
  var otherTab = window.open()
  if (otherTab !== null) {
    // Note: doesn't block referrer
    otherTab.opener = null
    otherTab.target = '_blank'
    otherTab.location = url
  }
  return otherTab
}

export const getRedirect = (formData, node) => {
  if (!node || !node.props.attrs.redirectMap) {
    return null
  }
  var redirectUrl = keyValOverlap(formData, node.props.attrs.redirectMap)
  if (redirectUrl && formData) {
    redirectUrl = strSubUrl(redirectUrl, formData)
  }
  return redirectUrl
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

export const getKey = (d, path, def) => {
  if (typeof (path) === 'string') {
    path = path.split('.')
  }
  if (typeof def !== 'undefined') {
    return path.reduce((x, y) => x[y] || def, d)
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

export const strSub = (str, obj, d = "") => str.replace(/\${(.*?)}/g, (x, g) => getKey(obj, g) || d);

export const strSubUrl = (str, obj, d = "") => str.replace(/\${(.*?)}/g, (x, g) => encodeURIComponent(getKey(obj, g) || d));

export function merge() {
  return Object.assign({}, ...arguments)
}