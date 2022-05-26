const postJSON = async (url, data) => {
  console.debug("Posting to " + url)
  const rawResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  const res = await rawResponse.json();
  console.debug("POST response:" + JSON.stringify(res, null, 2));
  return res
}


const redirect = (url) => {
  // similar behavior as clicking on a link, maintains back button
  console.debug('redirect to ' + url)
  window.location.href = url
}

const getKey = (d, path) => {
  if (typeof (path) === 'string') {
    path = path.split('.')
  }
  return path.reduce((x, y) => x[y], d)
}

const strSub = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => getKey(obj, g));

const strSubUrl = (str, obj) => str.replace(/\${(.*?)}/g, (x, g) => encodeURIComponent(getKey(obj, g)));

export { postJSON, redirect, getKey, strSub, strSubUrl }
