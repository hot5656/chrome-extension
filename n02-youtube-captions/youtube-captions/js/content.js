chrome.storage.sync.get(['doubleTitle'], (storage) => {
  // console.log('window.location', window.location.host)
  // change document.domain to window.location.host
  if (
    storage.doubleTitle &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    let xHook = chrome.extension.getURL('js/xhook.min.js')
    if (!document.head.querySelector(`script[src='${xHook}']`)) {
      function injectJs(src) {
        let script = document.createElement('script')
        script.src = src
        document.head.appendChild(script)
        return script
      }

      injectJs(xHook).onload = function () {
        this.onload = null
        injectJs(chrome.extension.getURL('js/injected.js'))
      }
    }
  }
})
