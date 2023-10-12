chrome.storage.sync.get(['doubleTitle'], (storage) => {
  // console.log('window.location.host', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitle &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    // console.log('found youtube-react')

    // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
    // set path
    // Robert(2023/10/12) : change from xhook to ajax-hook
    let xHook = chrome.runtime.getURL('ajaxhook.js')

    // not inject JS
    if (!document.head.querySelector(`script[src='${xHook}']`)) {
      function injectJs(src) {
        let script = document.createElement('script')
        script.src = src
        document.head.appendChild(script)
        return script
      }

      // load xhook.min.js
      injectJs(xHook).onload = function () {
        // 防止再次載入相同的腳本時重複執行該事件處理程序
        this.onload = null
        // load injected.js
        injectJs(chrome.runtime.getURL('injected.js'))
      }
    }
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

  languageDiv.setAttribute('data-language', 'zh-Hans')
  languageDiv.id = 'language-show'
  // console.log('languageDiv', languageDiv)
  // console.log('document.body', document.body)
  document.body.appendChild(languageDiv)

  chrome.storage.sync.get(['languageType'], (res) => {
    const languageType = res.languageType ?? 'zh-Hans'

    languageDiv.setAttribute('data-language', languageType)
  })
})

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  languageDiv.setAttribute('data-language', message.languageType)

  // console.log('message', message)
  // console.log('sender', sender)
  // console.log('languageType : ', message.languageType)
})
