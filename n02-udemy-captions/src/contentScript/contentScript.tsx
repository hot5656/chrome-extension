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

// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  console.log('contentScript load...')
  let languageDiv = document.createElement('div')

  languageDiv.setAttribute('data-language', 'zh-Hant')
  languageDiv.id = 'language-show'
  document.body.appendChild(languageDiv)

  chrome.storage.sync.get(['subtitleModeUdemy', 'language2ndUdemy'], (res) => {
    if (res.subtitleModeUdemy) {
      subtitleMode = res.subtitleModeUdemy
    }

    if (res.language2ndUdemy) {
      secondLanguage = res.language2ndUdemy
    }
  })

  checkContainerContent()
})

let INTERVAL_STEP = 1000
let activerCount = 1
let isMonitor = false
let isMonitorConnect = false
function checkIntervalContent() {
  const intervalId = setInterval(() => {
    const containertElement = document.querySelector(
      '.captions-display--captions-container--1SP58'
    )

    if (containertElement) {
      if (!isMonitor) {
        const handleTextChange = () => {
          const textElement = document.querySelector(
            '.captions-display--captions-cue-text--1W4Ia'
          )
          console.log('textElementx:', textElement)
          if (textElement) {
            console.log('Text content changed:', textElement.textContent)
          } else {
            console.log('textElement1:', textElement)
          }
        }

        console.log('add listen ....', containertElement)

        if (containertElement) {
          containertElement.addEventListener('change', handleTextChange)
        }

        isMonitor = true
      } else {
        const textElement = document.querySelector(
          '.captions-display--captions-cue-text--1W4Ia'
        )
        if (textElement) {
          console.log('check content value:', textElement.textContent)
        } else {
          console.log('textElement2:', textElement)
        }
      }
    }

    console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}

const handleTextChange = (mutationsList) => {
  for (const mutation of mutationsList) {
    // console.log('mutation.type:', mutation.type)
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      // console.log('Container content changed...')
      checkTextElement()
    }
  }
}

const observer = new MutationObserver(handleTextChange)

const config = {
  childList: true,
  subtree: true,
  characterData: true,
}

function checkContainerContent() {
  const intervalId = setInterval(() => {
    const containerElement = document.querySelector(
      '.captions-display--captions-container--1SP58'
    )

    if (containerElement) {
      addMysubtitle()

      if (!isMonitor) {
        observer.observe(containerElement, config)
        isMonitorConnect = true

        isMonitor = true
        clearInterval(intervalId)
      } else {
        // console.log('Checking container content...')
        // checkTextElement()
      }
    }
    console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}

let lastSubtitle = ''
function checkTextElement() {
  const textElement = document.querySelector(
    '.captions-display--captions-cue-text--1W4Ia'
  )
  const mysubtitleElement = document.querySelector('#my-subtitle')
  let tempSubtitle = ''

  // check for jump to next video
  if (!mysubtitleElement) {
    addMysubtitle()
  }

  if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_OFF]) {
    tempSubtitle = ''
  } else {
    if (textElement) {
      tempSubtitle = textElement.textContent
    } else {
      tempSubtitle = ''
    }
  }

  if (lastSubtitle !== tempSubtitle) {
    lastSubtitle = tempSubtitle

    if (lastSubtitle.length != 0) {
      if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_DUAL]) {
        tempSubtitle = tempSubtitle.replace(/%/g, 'percent')

        let xhr = new XMLHttpRequest()
        xhr.open(
          'GET',
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${secondLanguage}&dt=t&q=${tempSubtitle}`,
          false
        )
        xhr.send()

        if (xhr.status === 200) {
          let data = JSON.parse(xhr.responseText)
          let newWords = data[0][0][0]
          // console.log('newWords', newWords)
          mysubtitleElement.textContent = newWords + '\n' + lastSubtitle
        } else {
          mysubtitleElement.textContent = lastSubtitle
          throw new Error('Network response was not ok')
        }
      } else {
        lastSubtitle = tempSubtitle
        mysubtitleElement.textContent = lastSubtitle
      }

      console.log('Text content:', mysubtitleElement.textContent)
    } else {
      lastSubtitle = tempSubtitle
      mysubtitleElement.textContent = lastSubtitle
      console.log('Text element not found')
    }
  }
}

function addMysubtitle() {
  const containertElement = document.querySelector(
    '.captions-display--captions-container--1SP58'
  )
  let mysubtitleElement = document.querySelector('#my-subtitle')
  if (!mysubtitleElement) {
    mysubtitleElement = document.createElement('div')
    mysubtitleElement.id = 'my-subtitle'
    containertElement.appendChild(mysubtitleElement)
  }
}

// Function to handle page load
function handlePageLoad() {
  // Perform actions when the page is loaded
  console.log('Page loaded!')

  if (isMonitorConnect) {
    isMonitorConnect = false
    observer.disconnect()
    isMonitor = false
    activerCount = 1
    checkContainerContent()
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageLoaded') {
    handlePageLoad()
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'pageLoaded') {
    // Listen for messages from the background script
    handlePageLoad()
  } else if (request.message === MESSAGE_SUBTITLE_MODE) {
    sendResponse({ message: MESSAGE_SUBTITLE_MODE })
    subtitleMode = request.subtitleMode
    subtitleOffControl(subtitleMode)
  } else if (request.message === MESSAGE_2ND_LANGUAGE) {
    sendResponse({ message: MESSAGE_2ND_LANGUAGE })
    secondLanguage = request.secondLanguage
  }
})

function subtitleOffControl(subtitleMode) {
  let isOff = false
  const videoTitle = document.getElementById('subtitle-text') as HTMLElement
  if (videoTitle) {
    const videoTitletyle = window.getComputedStyle(videoTitle)
    if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_OFF]) {
      // @ts-ignore
      if (!videoTitletyle.style) {
        videoTitle.style.display = 'none'
      }
      isOff = true
    } else {
      // @ts-ignore
      if (videoTitle.style) {
        videoTitle.style.removeProperty('display')
      }
    }
  }
  return isOff
}
