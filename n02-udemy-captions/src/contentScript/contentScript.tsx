chrome.storage.sync.get(['doubleTitleUdemy'], (storage) => {
  // console.log('window.location.host', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitleUdemy &&
    ['www.udemy.com'].includes(window.location.host)
  ) {
    console.log('found udemy....')

    checkInterval()

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

// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  let languageDiv = document.createElement('div')

  languageDiv.setAttribute('data-language', 'zh-Hant')
  languageDiv.id = 'language-show'
  // console.log('languageDiv', languageDiv)
  // console.log('document.body', document.body)
  document.body.appendChild(languageDiv)

  chrome.storage.sync.get(['languageTypeUdemy'], (res) => {
    const languageTypeUdemy = res.languageTypeUdemy ?? 'zh-Hant'

    languageDiv.setAttribute('data-language', languageTypeUdemy)
  })
})

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  languageDiv.setAttribute('data-language', message.languageTypeUdemy)

  // console.log('message', message)
  // console.log('sender', sender)
  // console.log('languageTypeUdemy : ', message.languageTypeUdemy)
})

let INTERVAL_STEP = 1000
let activerCount = 1
function checkInterval() {
  const intervalId = setInterval(() => {
    const videoElement = document.querySelector(
      '#udemy video'
    ) as HTMLVideoElement
    console.log('videoElement', videoElement)

    if (videoElement) {
      videoElement.addEventListener('timeupdate', function () {
        // Get the current time in seconds
        var currentTime = videoElement.currentTime

        // Display or use the current time as needed
        console.log('Current Time: ' + currentTime)
      })
      clearInterval(intervalId)
    }
    console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}
