import amplitude from 'amplitude-js'

const logEvent = (name, properties, cb) => {
  if (window.amplitude) {
    window.amplitude.logEvent(name, properties, cb)
  }
}

const logPinterestEvent = (name, properties, cb) => {
  window.pintrk('track', name, properties, cb)
}

const logGAEvent = (name, properties, cb) => {
  window.gtag('event', name, properties, cb)
}

$(document).ready(function () {
  if (window.amplitudeId) {
    amplitude.getInstance().init(window.amplitudeId, null, {
      includeReferrer: true,
      includeUtm: true,
      includeGclid: true
    })

    window.amplitude = amplitude
  }

  $('a[data-ga-event]', document).on('click', (e) => {
    const $target = $(e.currentTarget)
    const ga_event_type = $target.data('gaEvent')
    const ga_properties = $target.data('gaProps')

    logGAEvent(ga_event_type, ga_properties)
  })

  $('a[data-tracking-event]', document).on('click', (e) => {
    const $target = $(e.currentTarget)
    const event_type = $target.data('trackingEvent')
    const properties = $target.data('trackingProps')
    const pinterest_event_type = $target.data('pinterestEvent')
    const pinterest_properties = $target.data('pinterestProps')

    logEvent(event_type, properties)

    if (pinterest_event_type && pinterest_properties) {
      logPinterestEvent(pinterest_event_type, pinterest_properties)
    }
  })

  // Trigger Amplitude page view event
  if (!sessionStorage.getItem('firstLoad')) {
    logEvent('system:click_universal_link')
    sessionStorage.setItem('firstLoad', new Date())
  }
})
