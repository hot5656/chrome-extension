// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  checkContainerContent()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'pageLoaded') {
    handlePageLoad()
    console.log('pageLoaded.....')
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
        mysubtitleElement.textContent = combinedText
        console.log('Text content changed:', combinedText)
        currentTubTitle = combinedText

        const text1stElement = document.querySelector(
          '.ytp-caption-segment'
        ) as HTMLElement
        if (text1stElement) {
          if (text1stElement.style) {
            // @ts-ignore
            mysubtitleElement.style.cssText = text1stElement.style.cssText
            currentStyle = text1stElement.style.cssText
            console.log('currentStyle:', currentStyle)
          }
        }
        const textHeadElement = document.querySelector(
          '.caption-window'
        ) as HTMLElement
        if (textHeadElement) {
          if (textHeadElement.style) {
            console.log('textHeadElement:', textHeadElement.style.cssText)
            console.log(
              'textHeadElement.style.width:',
              textHeadElement.style.width,
              textHeadElement.style.marginLeft
            )
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
        isMonitorConnect = true

        isMonitor = true
        clearInterval(intervalId)
      } else {
        // console.log('Checking container content...')
        // checkTextElement()
      }

      //   clearInterval(intervalId)
      //   console.log('stop interval ...')
      // } else {
      //   console.log('no containerElement ...')
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
  let mysubtitleElement = document.querySelector('#my-subtitle')
  console.log('mysubtitleElement', mysubtitleElement)
  if (!mysubtitleElement) {
    mysubtitleElement = document.createElement('div')
    mysubtitleElement.id = 'my-subtitle'
    mysubtitleElement.textContent = 'ABC...'
    // if (subOrigionElement) {
    //   subOrigionElement.appendChild(mysubtitleElement)
    // }
    containertElement.appendChild(mysubtitleElement)
    console.log('mysubtitleElement2', mysubtitleElement)
  }
  console.log('addMysubtitle end')

  {
    // Start observing the target node for configured mutations
    observer.observe(containertElement, config)
  }
}

let isMonitor = false
let isMonitorConnect = false
function handlePageLoad() {
  // console.log('Page loaded!')

  if (isMonitorConnect) {
    isMonitorConnect = false
    observer.disconnect()
    isMonitor = false
    activerCount = 1
    checkContainerContent()
  }
}

// .ytp-caption-window-container - up
// xx .caption-window - all up
// .ytp-caption-segment - one
