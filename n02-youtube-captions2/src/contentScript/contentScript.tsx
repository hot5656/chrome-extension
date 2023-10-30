chrome.storage.sync.get(['doubleTitleYoutube', 'translateMode'], (storage) => {
  // console.log('window.location.host', window.location.host)
  // console.log(storage)
  // console.log('storage.doubleTitleYoutube:', storage.doubleTitleYoutube)
  // console.log('window.location.host:', window.location.host)

  // change document.domain to window.location.host %?%
  if (
    storage.doubleTitleYoutube &&
    ['www.youtube.com'].includes(window.location.host)
  ) {
    console.log('found youtube.....')
    if (storage.doubleTitleYoutube) {
      let injectFile = 'injected.js'

      // add run chrome extension label
      addLabel(storage.translateMode + 'Translate')

      if (storage.translateMode != 'Youtube') {
        injectFile = 'injected_online.js'
      }

      // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
      // set path
      // Robert(2023/10/12) : change from xhook to ajax-hook
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
          // console.log('injectJs : ', injectFile)

          // 防止再次載入相同的腳本時重複執行該事件處理程序
          this.onload = null
          // load injected.js
          injectJs(chrome.runtime.getURL(injectFile))
        }
      }
    }
  }
})

function addLabel(label) {
  let buttonsHead = document.querySelector('#end.style-scope.ytd-masthead')
  // console.log(buttonsHead)

  const button = document.createElement('button')
  // button.innerText = 'Youtube Translate'
  button.innerText = label
  buttonsHead.append(button)
}

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

  chrome.storage.sync.get(['languageTypeYoutube'], (res) => {
    const languageTypeYoutube = res.languageTypeYoutube ?? 'zh-Hans'

    languageDiv.setAttribute('data-language', languageTypeYoutube)
  })
})

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  languageDiv.setAttribute('data-language', message.languageTypeYoutube)

  // console.log('message', message)
  // console.log('sender', sender)
  // console.log('languageTypeYoutube : ', message.languageTypeYoutube)
})
