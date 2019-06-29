import fetch from 'isomorphic-fetch';

const jsonHeaders = (oldHeaders) => ({
  ...oldHeaders,
  Accept: 'application/json',
  'Content-Type': 'application/json',
});

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const err = new Error('Status: ' + response.status, response.body);
    err.response = response;
    throw err;
  }
}

export const toJson = function toJson(response) {
  return response.json();
};


export const fetchClosest = (X, Y) =>
  postJson(`/api/v2/closest`, { X: X, Y: Y }, {})
    .then(toJson)
    .then(data => data.filter(result => result.PlaceType === 'Stop'))
    .then(data => {
      return {
        result: data,
      }
    })
    .catch(err => {
      return {
        error: err,
      }
    });

export const postJson = (url, body, headers) =>
  fetch(url, {
    method: 'POST',
    headers: jsonHeaders(headers),
    body: JSON.stringify(body),
  })
    .then(checkStatus)
