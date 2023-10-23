chrome.storage.sync.get(['doubleTitleYoutube2'], (storage) => {
  // console.log('window.location.host', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitleYoutube2 &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    console.log('found youtube-react')

    // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
    // set path
    let ajaxHook = chrome.runtime.getURL('ajaxhook.js')

    // not inject JS
    if (!document.head.querySelector(`script[src='${ajaxHook}']`)) {
      function injectJs(src) {
        let script = document.createElement('script')
        script.src = src
        document.head.appendChild(script)
        return script
      }

      // load ajaxHook
      injectJs(ajaxHook).onload = function () {
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

// window.addEventListener('load', function () {
// })

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  languageDiv.setAttribute('data-language', message.languageTypeYoutube2)

  // console.log('message', message)
  // console.log('sender', sender)
  // console.log('languageTypeYoutube2 : ', message.languageTypeYoutube2)
})

// set data-language, and get langeage from chrome storge
{
  let languageDiv = document.createElement('div')

  languageDiv.setAttribute('data-language', 'zh-Hant')
  languageDiv.id = 'language-show'
  // console.log('languageDiv', languageDiv)
  // console.log('document.body', document.body)
  document.body.appendChild(languageDiv)

  chrome.storage.sync.get(['languageTypeYoutube2'], (res) => {
    const languageTypeYoutube2 = res.languageTypeYoutube2 ?? 'zh-Hant'

    languageDiv.setAttribute('data-language', languageTypeYoutube2)
  })
}
