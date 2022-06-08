export const postJSON = async (url, data) => {
  console.debug("Posting to " + url)
  const rawResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!rawResponse.ok) {
    throw Error(rawResponse.statusText);
  }
  const res = await rawResponse.json();
  console.debug("POST response:" + JSON.stringify(res, null, 2));
  return res
}

export const redirect = (url) => {
  // similar behavior as clicking on a link, maintains back button
  window.location.href = url
}

export const getKey = (d, path) => {
  if (typeof (path) === 'string') {
    path = path.split('.')
  }
  return path.reduce((x, y) => x[y], d)
}

export const strSub = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => getKey(obj, g));

export const strSubUrl = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => encodeURIComponent(getKey(obj, g)));

export function merge() {
  return Object.assign({}, ...arguments)
}