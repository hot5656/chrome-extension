chrome.storage.sync.get(['doubleTitle'], (storage) => {
  console.log('window.location.host', window.location.host)
  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitle &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    console.log('found youtube')
    // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
    // set path
    let xHook = chrome.runtime.getURL('js/xhook.min.js')

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
        injectJs(chrome.runtime.getURL('js/injected.js'))
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
