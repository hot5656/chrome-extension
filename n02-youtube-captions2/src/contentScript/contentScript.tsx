// import xhook from 'xhook'

chrome.storage.sync.get(['doubleTitle'], (storage) => {
  console.log('window.location.host', window.location.host)

  //  add languageDiv
  // {
  //   const languageDiv = document.createElement('div')

  //   languageDiv.setAttribute('data-language', 'zh-Hans')
  //   languageDiv.id = 'language-show'
  //   document.body.appendChild(languageDiv)
  // }

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
chrome.runtime.sendMessage(
  { message: 'hi, message from content script' },
  (response) => {
    console.log(response.message)
  }
)

window.addEventListener('load', function () {
  let languageDiv = document.createElement('div')

  languageDiv.setAttribute('data-language', 'zh-Hans')
  languageDiv.id = 'language-show'
  console.log('languageDiv', languageDiv)
  console.log('document.body', document.body)
  document.body.appendChild(languageDiv)

  chrome.storage.sync.get(['simpleChinese'], (res) => {
    // if undefine or null return flase
    const isSimpleChinese = res.simpleChinese ?? false

    languageDiv.setAttribute(
      'data-language',
      // isSimpleChinese ? 'zh-Hans' : 'ja'
      isSimpleChinese ? 'zh-Hans' : 'zh-Hant'
    )

    console.log(
      'content data-language :',
      isSimpleChinese ? 'zh-Hans' : 'zh-Hant'
    )
  })
})
