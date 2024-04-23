import {
  MESSAGE_SUBTITLE_MODE,
  MESSAGE_2ND_LANGUAGE,
  SUBTITLE_MODE,
  SUBTITLE_MODE_OFF,
  SUBTITLE_MODE_DUAL,
  SECOND_LANGUES_TRADITIONAL,
  SECOND_LANGUES,
} from '../utils/messageType'

let secondLanguage = SECOND_LANGUES[SECOND_LANGUES_TRADITIONAL].value
let subtitleMode = SUBTITLE_MODE[SUBTITLE_MODE_DUAL]

function loadHook() {
  chrome.storage.sync.get(
    ['subtitleModeYoutube', 'language2ndYoutube'],
    (res) => {
      if (res.subtitleModeYoutube) {
        subtitleMode = res.subtitleModeYoutube
      }

      if (res.language2ndYoutube) {
        secondLanguage = res.language2ndYoutube
      }
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
    }
  )
}

// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  checkContainerContent()

  // load hook
  loadHook()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageLoaded') {
    handlePageLoad()
    // console.log('pageLoaded.....')
  } else if (request.message === MESSAGE_SUBTITLE_MODE) {
    sendResponse({ message: MESSAGE_SUBTITLE_MODE })
    subtitleMode = request.subtitleMode
    subtitleOffControl(subtitleMode)
    // console.log('MESSAGE_SUBTITLE_MODE')
  } else if (request.message === MESSAGE_2ND_LANGUAGE) {
    sendResponse({ message: MESSAGE_2ND_LANGUAGE })
    secondLanguage = request.secondLanguage
    // console.log('MESSAGE_2ND_LANGUAGE')
  }
})

window.addEventListener('message', (event) => {
  if (event.source === window && event.data.type === 'FROM_INJECTED') {
    // console.log(event.data.message)

    let mysubtitleElement = document.querySelector('#my-subtitle')
    if (!mysubtitleElement) {
      handlePageLoad()
    }
  }
})

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      // console.log('Text content changed:', textElement.textContent)
      const textElements = document.querySelectorAll('.ytp-caption-segment')
      let combinedText = ''

      textElements.forEach((textElement) => {
        combinedText += textElement.textContent + ' '
      })

      combinedText = combinedText.trim()
      if (currentTubTitle !== combinedText) {
        let mysubtitleElement = document.querySelector('#my-subtitle')
        if (mysubtitleElement) {
          let tempSubtitle = combinedText.replace(/%/g, 'percent')

          if (
            combinedText.length != 0 &&
            subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_DUAL]
          ) {
            let xhr = new XMLHttpRequest()
            xhr.open(
              'GET',
              `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${secondLanguage}&dt=t&q=${tempSubtitle}`,
              false
            )
            xhr.send()

            if (xhr.status === 200) {
              let data = JSON.parse(xhr.responseText)
              //   let newWords = data[0][0][0]
			  // Robert(2024/04/22) : fix some translate data not show
			  let newWords = ''
			  // console.log(`data[0].length : ${data[0].length}`)
			  for (let i = 0; i < data[0].length; i++) {
			  	  // console.log(`data[0][${i}][0] ${data[0][i][0]}`)
				  newWords += data[0][i][0]
			  }

              // console.log('newWords', newWords)
              mysubtitleElement.textContent = newWords + '\n' + combinedText
            } else {
              mysubtitleElement.textContent = combinedText
              throw new Error('Network response was not ok')
            }
          } else {
            mysubtitleElement.textContent = combinedText
          }
          // console.log('Text content changed:', combinedText)
          currentTubTitle = combinedText

          const text1stElement = document.querySelector(
            '.ytp-caption-segment'
          ) as HTMLElement
          if (text1stElement) {
            if (text1stElement.style) {
              // @ts-ignore
              mysubtitleElement.style.cssText = text1stElement.style.cssText
              currentStyle = text1stElement.style.cssText
              // console.log('currentStyle:', currentStyle)
            }
          }
          const textHeadElement = document.querySelector(
            '.caption-window'
          ) as HTMLElement
          if (textHeadElement) {
            if (textHeadElement.style) {
              // console.log('textHeadElement:', textHeadElement.style.cssText)
              // console.log(
              //   'textHeadElement.style.width:',
              //   textHeadElement.style.width,
              //   textHeadElement.style.marginLeft
              // )
              if (textHeadElement.style.width) {
                // @ts-ignore
                mysubtitleElement.style.width = textHeadElement.style.width
              }
              if (textHeadElement.style.marginLeft) {
                // @ts-ignore
                mysubtitleElement.style.marginLeft =
                  textHeadElement.style.marginLeft
              }
            }
          }

          const textLeftlement = document.querySelector(
            '.caption-window'
          ) as HTMLElement
          if (textLeftlement) {
            if (textLeftlement.style.left) {
              // @ts-ignore
              mysubtitleElement.style.left = textLeftlement.style.left
            }
          }
        }
      }
    }
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

let INTERVAL_STEP = 1000
let activerCount = 1
let currentTubTitle = ''
let currentStyle: string = ''
function checkContainerContent() {
  const intervalId = setInterval(() => {
    const containerElement = document.querySelector(
      '.ytp-caption-window-container'
    )
    if (containerElement) {
      addMysubtitle()

      if (!isMonitor) {
        observer.observe(containerElement, config)
        // console.log('2nd observer... ')

        isMonitorConnect = true

        isMonitor = true
        clearInterval(intervalId)
      }
    }
    // console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}

function addMysubtitle() {
  // console.log('addMysubtitle')
  const containertElement = document.querySelector(
    '.ytp-caption-window-container'
  )
  let mysubtitleElement = document.querySelector('#my-subtitle')
  // console.log('mysubtitleElement', mysubtitleElement)
  if (!mysubtitleElement) {
    mysubtitleElement = document.createElement('div')
    mysubtitleElement.id = 'my-subtitle'
    // mysubtitleElement.textContent = 'ABC...'
    containertElement.appendChild(mysubtitleElement)
    subtitleOffControl(subtitleMode)
    // console.log('mysubtitleElement2', mysubtitleElement)
  }
  // console.log('addMysubtitle end')
}

let isMonitor = false
let isMonitorConnect = false
function handlePageLoad() {
  // console.log('Page loaded!')

  if (isMonitorConnect) {
    isMonitorConnect = false
    observer.disconnect()

    // console.log('discoonnect observer... ')
    isMonitor = false
    activerCount = 1
    checkContainerContent()
  }
}

function subtitleOffControl(subtitleMode) {
  const mySubtitleElement = document.getElementById(
    'my-subtitle'
  ) as HTMLElement
  if (mySubtitleElement) {
    if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_OFF]) {
      mySubtitleElement.classList.add('no-display')
    } else {
      mySubtitleElement.classList.remove('no-display')
    }
  }
}
