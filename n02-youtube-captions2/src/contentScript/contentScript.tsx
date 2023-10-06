chrome.storage.sync.get(['doubleTitle'], (storage) => {
  console.log('window.location.host', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitle &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    console.log('found youtube-react')

    // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
    // set path
    let xHook = chrome.runtime.getURL('xhook.min.js')

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

  chrome.storage.sync.get(['simpleChinese', 'languageType'], (res) => {
    // if undefine or null return flase
    const isSimpleChinese = res.simpleChinese ?? false
    const languageType = res.languageType ?? 'zh-Hans'

    languageDiv.setAttribute('data-language', languageType)

    // languageDiv.setAttribute(
    //   'data-language',
    //   // isSimpleChinese ? 'zh-Hans' : 'ja'
    //   isSimpleChinese ? 'zh-Hans' : 'zh-Hant'
    // )

    // console.log(
    //   'content data-language :',
    //   isSimpleChinese ? 'zh-Hans' : 'zh-Hant'
    // )
  })
})

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  // languageDiv.setAttribute('data-language', message.language_mode)
  languageDiv.setAttribute('data-language', message.languageType)

  // console.log('message', message)
  // console.log('sender', sender)
  console.log('language_mode : ', message.language_mode)
  console.log('languageType : ', message.languageType)
})
