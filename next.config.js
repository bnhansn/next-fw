module.exports = {
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiHost: process.env.API_HOST,
    pixelHost: process.env.PIXEL_HOST
  }
}
