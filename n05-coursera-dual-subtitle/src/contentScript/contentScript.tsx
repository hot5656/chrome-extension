chrome.storage.sync.get(['doubleTitleUdemy'], (storage) => {
  // console.log('window.location.host', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitleUdemy &&
    ['www.coursera.org'].includes(window.location.host)
  ) {
    console.log('found udemy....')

    // // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
    // // set path
    // let ajaxHook = chrome.runtime.getURL('ajaxhook.js')

    // // not inject JS
    // if (!document.head.querySelector(`script[src='${ajaxHook}']`)) {
    //   function injectJs(src) {
    //     let script = document.createElement('script')
    //     script.src = src
    //     document.head.appendChild(script)
    //     return script
    //   }

    //   // load ajaxHook
    //   injectJs(ajaxHook).onload = function () {
    //     // 防止再次載入相同的腳本時重複執行該事件處理程序
    //     this.onload = null
    //     // load injected.js
    //     injectJs(chrome.runtime.getURL('injected.js'))
    //   }
    // }
  }
})

// content send message(it is always send to background)
// chrome.runtime.sendMessage(
//   { message: 'hi, message from content script' },
//   (response) => {
//     console.log(response.message)
//   }
// )

// // when all page load complete, set data-language, and get langeage from chrome storge
// window.addEventListener('load', function () {
//   let languageDiv = document.createElement('div')

//   languageDiv.setAttribute('data-language', 'zh-Hant')
//   languageDiv.id = 'language-show'
//   // console.log('languageDiv', languageDiv)
//   // console.log('document.body', document.body)
//   document.body.appendChild(languageDiv)

//   chrome.storage.sync.get(['languageTypeUdemy'], (res) => {
//     const languageTypeUdemy = res.languageTypeUdemy ?? 'zh-Hant'

//     languageDiv.setAttribute('data-language', languageTypeUdemy)
//   })
// })

// // Robert(2023/10/06) : popup send message to content script for change language
// chrome.runtime.onMessage.addListener((message, sender) => {
//   const languageDiv = document.getElementById('language-show')
//   languageDiv.setAttribute('data-language', message.languageTypeUdemy)

//   // console.log('message', message)
//   // console.log('sender', sender)
//   // console.log('languageTypeUdemy : ', message.languageTypeUdemy)
// })

let timer = 0
window.addEventListener('load', function () {
  console.log('contentScript load...')
  let languageElements = document.querySelectorAll('video track')
  console.log(timer, 'languageElements:', languageElements)
  for (let element of languageElements) {
    console.log(typeof element, element)
  }

  const intervalId = setInterval(() => {
    let videoElement = document.querySelector('video')
    let languages = []
    if (videoElement) {
      console.log('found videoElement :', typeof videoElement)
      console.log(videoElement.ariaLabel)

      let sourceElements = document.querySelectorAll('video source')
      console.log(sourceElements)
      for (let source of sourceElements as NodeListOf<HTMLTrackElement>) {
        console.log(source.src)
      }
    }
    let languageElements = document.querySelectorAll('video track')
    timer = timer + 1000
    // console.log(timer, 'languageElements:', languageElements)
    for (let element of languageElements as NodeListOf<HTMLTrackElement>) {
      languages.push(element.srclang)
      // console.log(`${element.srclang} ${element.src}`)
      // console.log(typeof element, element)
    }
    if (languages.length > 0) {
      console.log(languages)
      // stop the interval
      clearInterval(intervalId)
    }
  }, 1000)
})
