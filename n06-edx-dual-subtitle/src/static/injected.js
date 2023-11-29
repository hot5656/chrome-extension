window.addEventListener('load', function () {
  console.log('injected ....')
})

// window.addEventListener('message', (msg) => {
//   console.log('Message event:', msg)
//   if (msg.channel !== 'myExtension') {
//     return
//   }
//   // if (msg.message === 'loaded') {
//   console.log('msg:', msg)
//   // }
// })

// window.addEventListener('message', (e) => {
//   if (e.origin !== window.location.origin) {
//     return
//   }
//   console.log('received message', e)
// })

window.addEventListener('message', (e) => {
  // check self send
  if (e.origin !== window.location.origin) {
    return
  }

  console.log('e', e)
  messages = e.data
  console.log('msg:', messages)

  if (messages.message === 'get iframe content') {
    fetch(messages.url, { mode: 'no-cors' }).then((res) => {
      console.log('res', res)
      // res.text()
    })
    // .then((data) => sendResponse({ content: data }))
  } else {
    const iframe = document.querySelector('iframe#unit-iframe')
    if (iframe) {
      const iframeContent = iframe.contentDocument.body.innerHTML
      console.log('Iframe content:', iframeContent)
      console.log('Iframe content2:', iframe.contentDocument)
      console.log('Iframe content3:', iframe.contentDocument.body)
    }
    const videoSelElement = document.querySelector('.btn-link.video-sources')
    console.log('videoSelElement:', videoSelElement)
  }
})
