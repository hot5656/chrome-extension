function loadHook() {
  chrome.storage.sync.get(
    ['doubleTitleYoutube', 'translateMode'],
    (storage) => {
      // console.log('window.location.host', window.location.host)
      // console.log(storage)
      // console.log('storage.doubleTitleYoutube:', storage.doubleTitleYoutube)
      // console.log('window.location.host:', window.location.host)

      // change document.domain to window.location.host %?%

      // if (
      //   storage.doubleTitleYoutube &&
      //   ['www.youtube.com'].includes(window.location.host)
      // ) {
      console.log('found youtube.....')

      // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
      // set path
      let xHook = chrome.runtime.getURL('xhook.js')
      let injectFile = 'injected.js'

      // not inject JS
      if (!document.head.querySelector(`script[src='${xHook}']`)) {
        function injectJs(src) {
          let script = document.createElement('script')
          script.src = src
          document.head.appendChild(script)
          return script
        }

        // load xHook
        injectJs(xHook).onload = function () {
          // console.log('injectJs : ', injectFile)

          // 防止再次載入相同的腳本時重複執行該事件處理程序
          this.onload = null
          // load injected.js
          injectJs(chrome.runtime.getURL(injectFile))
        }
      }

      // if (storage.doubleTitleYoutube) {
      //   let injectFile = 'injected.js'

      //   // add run chrome extension label
      //   addLabel(storage.translateMode + 'Translate')

      //   if (storage.translateMode != 'Youtube') {
      //     injectFile = 'injected_online.js'
      //   }

      //   // v3 for chrome.extension.getURL - chrome.runtime.getURL %?%
      //   // set path
      //   let xHook = chrome.runtime.getURL('xhook.js')

      //   // not inject JS
      //   if (!document.head.querySelector(`script[src='${xHook}']`)) {
      //     function injectJs(src) {
      //       let script = document.createElement('script')
      //       script.src = src
      //       document.head.appendChild(script)
      //       return script
      //     }

      //     // load xHook
      //     injectJs(xHook).onload = function () {
      //       // console.log('injectJs : ', injectFile)

      //       // 防止再次載入相同的腳本時重複執行該事件處理程序
      //       this.onload = null
      //       // load injected.js
      //       injectJs(chrome.runtime.getURL(injectFile))
      //     }
      //   }
      // }
      // }
    }
  )
}

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
  checkContainerContent()

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
  // load hook
  // loadHook()
})

loadHook()

// Robert(2023/10/06) : popup send message to content script for change language
chrome.runtime.onMessage.addListener((message, sender) => {
  const languageDiv = document.getElementById('language-show')
  languageDiv.setAttribute('data-language', message.languageTypeYoutube)

  // console.log('message', message)
  // console.log('sender', sender)
  // console.log('languageTypeYoutube : ', message.languageTypeYoutube)
})

let INTERVAL_STEP = 1000
let activerCount = 1
let currentTubTitle = ''
function checkContainerContent() {
  const intervalId = setInterval(() => {
    const containerElement = document.querySelector(
      '.ytp-caption-window-container'
    )
    if (containerElement) {
      addMysubtitle()
      clearInterval(intervalId)
      console.log('stop interval ...')
    } else {
      console.log('no containerElement ...')
    }
    console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}
function addMysubtitle() {
  console.log('addMysubtitle')
  const containertElement = document.querySelector(
    '.ytp-caption-window-container'
  )
  const subOrigionElement = document.querySelector(
    'caption-window.ytp-caption-window-bottom'
  )
  let mysubtitleElement = document.querySelector('#my-subtitle')
  console.log('mysubtitleElement', mysubtitleElement)
  if (!mysubtitleElement) {
    mysubtitleElement = document.createElement('div')
    mysubtitleElement.id = 'my-subtitle'
    mysubtitleElement.textContent = 'ABC...'
    if (subOrigionElement) {
      subOrigionElement.appendChild(mysubtitleElement)
    }
    console.log('mysubtitleElement2', mysubtitleElement)
  }
  console.log('addMysubtitle end')

  {
    // const textElement = document.querySelector(
    // 	'.captions-display--captions-cue-text--1W4Ia'
    // )

    // Callback function to execute when mutations are observed
    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData'
        ) {
          // console.log('Text content changed:', textElement.textContent)
          const textElements = document.querySelectorAll('.ytp-caption-segment')
          let combinedText = ''

          textElements.forEach((textElement) => {
            combinedText += textElement.textContent + ' '
          })

          combinedText = combinedText.trim()
          if (currentTubTitle !== combinedText) {
            let mysubtitleElement = document.querySelector('#my-subtitle')
            mysubtitleElement.textContent = combinedText
            console.log('Text content changed:', combinedText)
            currentTubTitle = combinedText
          }
        }

        // if (textElement) {
        //   if (currentTubTitle !== textElement.textContent) {
        //     let mysubtitleElement = document.querySelector('#my-subtitle')
        //     if (mysubtitleElement) {
        //       mysubtitleElement.textContent = textElement.textContent
        //     }
        //     console.log('Text content changed:', textElement.textContent)
        //     currentTubTitle = textElement.textContent
        //   }
        // } else {
        //   console.log('no data....')
        // }
        // }
      }
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback)

    // Configuration of the observer:
    const config = {
      childList: true,
      subtree: true,
      characterData: true,
    }

    // Start observing the target node for configured mutations
    observer.observe(containertElement, config)
  }
}

// .ytp-caption-window-container
// .ytp-caption-segment
