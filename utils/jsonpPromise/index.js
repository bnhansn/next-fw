import jsonp from 'jsonp'

export default (url, params) =>
  new Promise((resolve, reject) =>
    jsonp(url, params, (err, data) => {
      if (err) {
        reject(err)
      }
      if (data) {
        resolve(data)
      }
    })
  )
