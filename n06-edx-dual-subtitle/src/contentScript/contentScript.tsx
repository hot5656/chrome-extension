import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import { SHOW_ACTIVE, LANGUGAES_INFO, UDAL_MODE } from '../utils/messageType'

let ACTIVE_COUNT_MAX = 10
let INTERVAL_STEP = 1000

let activerCount = 1
let intervalRun = false

function SecondSubtitle() {
  return <>ABC</>
}

window.addEventListener('load', function () {
  console.log('contentScript load...')
  checkInterval()
})

function checkInterval() {
  intervalRun = true
  activerCount = 1
  const intervalId = setInterval(() => {
    let iframeElement = document.querySelector('iframe#unit-iframe')
    if (iframeElement) {
      // iframeElement.removeAttribute('referrerpolicy')
      // console.log("iframeElement", iframeElement)

      let preButton = document.querySelector(
        '.previous-btn.btn.btn-link'
      ) as HTMLButtonElement
      let titleIndex = 1
      let btnlinkElements = document.querySelectorAll(
        'a.btn.btn-link'
      ) as NodeListOf<SVGElement>
      let titleLabel = 'none@@'

      if (preButton) {
        if (preButton.disabled) {
          titleIndex = 0
        }
      }
      if (btnlinkElements.length >= titleIndex + 1) {
        titleLabel = btnlinkElements[titleIndex].getAttribute('title')
      }
      console.log('title:', iframeElement.getAttribute('title'))

      if (iframeElement.getAttribute('title') !== titleLabel) {
        // console.log('found title...')
        // let lectureIconElement = document.querySelector(
        //   'a.active.btn'
        // ) as HTMLElement
        // lectureIconElement.style.color = 'red'
        // console.log('lectureIconElement:', lectureIconElement)

        // clear all
        let lectureIconSvgElements = document.querySelectorAll(
          'a.btn.btn-link>svg'
        ) as NodeListOf<SVGElement>
        lectureIconSvgElements.forEach((element) => {
          if (element.style.color !== undefined) {
            element.style.removeProperty('color')
          }
          if (element.style.height !== undefined) {
            element.style.removeProperty('height')
          }
        })

        // set more bigger
        let lectureSvgElement = document.querySelector(
          'a.active.btn svg'
        ) as HTMLElement
        console.log('lectureSvgElement:', lectureSvgElement)
        lectureSvgElement.style.height = '32px'
        lectureSvgElement.style.color = 'red'

        {
          let videoElement = document.querySelector(
            '.wrapper-downloads .video-sources'
          ) as HTMLAnchorElement
          let srtElement = document.querySelector(
            '.wrapper-download-transcripts .btn-link'
          )
          if (videoElement) {
            console.log('videoElement', videoElement.href)
          }
          if (srtElement) {
            console.log('srtElement', videoElement.href)
          }
        }

        console.log('chrome.tabs.query...')
        let iframeElement = document.getElementById(
          'unit-iframe'
        ) as HTMLIFrameElement
        // let iframeContentElement = iframeElement.contentWindow.document
        // console.log('iframeContentElement', iframeContentElement)

        const scriptIframeElement = document.querySelector(
          'script-iframe-content'
        )
        if (!scriptIframeElement) {
          const scriptElement = document.createElement('script')
          // scriptElement.textContent = `console.log("123")`
          // scriptElement.textContent = `window.parent.postMessage({ type: 'getIframeContent' }, '*')`
          scriptElement.setAttribute('src', 'script.js')
          scriptElement.id = 'script-iframe-content'

          // Append the script element to the body
          iframeElement.appendChild(scriptElement)
          console.log('scriptElement', scriptElement)
        }

        // chrome.runtime.sendMessage(
        //   {
        //     message: 'get iframe content',
        //     url: iframeElement.src,
        //   },
        //   (response) => {
        //     console.log('response.content', response.content)
        //   }
        // )

        // window.postMessage(
        //   {
        //     message: 'get iframe content',
        //     url: iframeElement.src,
        //   },
        //   '*'
        // )

        // window.postMessage('test')

        // window.addEventListener('message', (e) => {
        //   console.log(e.data)
        // })

        // window.postMessage(
        //   {
        //     // from: 'contentScript',
        //     channel: 'myExtension',
        //     message: 'loaded',
        //   },
        //   '*'
        // )

        // const msg = {
        //   channel: 'myExtension',
        //   message: 'loaded',
        // }

        // console.log('Sending message:', msg)

        // window.postMessage(msg, '*')

        // const iframe = document.getElementsByTagName('iframe')[0]

        // iframe.onload = () => {
        //   const nestedFrame =
        //     iframe.contentDocument.getElementsByTagName('iframe')[0]

        //   chrome.runtime.sendMessage(
        //     {
        //       getNestedIframeContent: true,
        //       url: nestedFrame.src,
        //     },
        //     (response) => {
        //       // Access proxied content
        //       console.log(response.content)
        //     }
        //   )
        // }

        // let iframe = document.getElementsByTagName('iframe')[0]

        // // Wait for iframe load to complete
        // iframe.onload = function () {
        // 	// Access Iframe document body
        // 	let iframeDoc =
        // 		iframe.contentDocument || iframe.contentWindow.document
        // 	let body = iframeDoc.body

        // 	// Display iframe body HTML
        // 	console.log('body.innerHTML', body.innerHTML)
        // }

        // let iframe = document.getElementsByTagName('iframe')[0]

        // chrome.runtime.sendMessage(
        //   {
        //     getIframeContent: true,
        //     iframeUrl: iframe.src,
        //   },
        //   (response) => {
        //     let iframeContent = response.content

        //     // Do something with the content
        //     console.log(iframeContent)
        //   }
        // )

        // // Assuming you have a reference to the iframe element
        // const iframe = document.querySelector(
        //   'iframe#unit-iframe'
        // ) as HTMLIFrameElement

        // if (iframe) {
        //   const iframeContent = iframe.contentDocument.body.innerHTML
        //   console.log('Iframe content:', iframeContent)
        //   console.log('Iframe content2:', iframe.contentDocument)
        //   console.log('Iframe content3:', iframe.contentDocument.body)
        // } else {
        //   console.error('Iframe with ID "unit-iframe" not found.')
        // }

        // // Find the iframe by its ID
        // let iframe = document.querySelector(
        //   'iframe#unit-iframe'
        // ) as HTMLIFrameElement

        // if (iframe) {
        //   // Send a message to the background script to request iframe content
        //   chrome.runtime.sendMessage(
        //     { action: 'getIframeContent', iframeSrc: iframe.src },
        //     function (response) {
        //       if (chrome.runtime.lastError) {
        //         console.error(chrome.runtime.lastError)
        //         return
        //       }

        //       // Handle the response, which contains the iframe content
        //       const iframeContent = response.iframeContent
        //       console.log(
        //         'Content of iframe with ID "unit-iframe":',
        //         iframeContent
        //       )
        //     }
        //   )
        // } else {
        //   console.error('Iframe with ID "unit-iframe" not found.')
        // }

        // // Send a message to the background script to request information about the current tab
        // chrome.runtime.sendMessage(
        //   { action: 'getCurrentTabInfo' },
        //   function (response) {
        //     if (chrome.runtime.lastError) {
        //       console.error(chrome.runtime.lastError)
        //       return
        //     }

        //     // Handle the response, which contains information about the current tab
        //     const tabInfo = response.tabInfo
        //     const iframes = response.iframes

        //     console.log('Information about the current tab:', tabInfo)
        //     console.log('Iframes within the current tab:', iframes)
        //   }
        // )

        // // Query all frames in the current tab
        // chrome.tabs.query(
        //   { active: true, currentWindow: true },
        //   function (tabs) {
        //     console.log(tabs)
        //     // const tabId = tabs[0].id

        //     // // Get all frames in the tab
        //     // chrome.webNavigation.getAllFrames(
        //     //   { tabId: tabId },
        //     //   function (details) {
        //     //     handleFrames(details)
        //     //   }
        //     // )
        //   }
        // )

        // // Query all frames in the current tab
        // chrome.tabs.query(
        //   { active: true, currentWindow: true },
        //   function (tabs) {
        //     const tabId = tabs[0].id

        //     // Get all frames in the tab
        //     chrome.webNavigation.getAllFrames(
        //       { tabId: tabId },
        //       function (details) {
        //         handleFrames(details)
        //       }
        //     )
        //   }
        // )

        // let btnElements = document.querySelectorAll('.btn-link')
        // console.log('btnElements:', btnElements)

        // let iframe = document.querySelector(
        //   'iframe#unit-iframe'
        // ) as HTMLIFrameElement
        // console.log('iframeElement', iframe)
        // console.log('iframe.contentDocument', iframe.contentDocument)
        // if (iframe) {
        //   // Use executeScript to inject a script into the iframe
        //   chrome.scripting.executeScript({
        //     target: { tabId: chrome.tabs.TAB_ID_NONE }, // Execute in the context of the active tab
        //     function: (iframeContent: Document | null) => {
        //       // Code to be executed in the context of the iframe
        //       console.log(
        //         'Iframe content:',
        //         iframeContent ? iframeContent.textContent : 'Iframe not found'
        //       )
        //     },
        //     args: [iframe.contentDocument],
        //   })
        // }

        // contentScript.tsx

        // // Find the iframe in the current page
        // const iframe = document.getElementById(
        //   'unit-iframe'
        // ) as HTMLIFrameElement

        // // Check if the iframe is found
        // if (iframe) {
        //   // Use executeScript to inject a script into the iframe
        //   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        //     if (tabs.length > 0) {
        //       chrome.tabs.executeScript(tabs[0].id, {
        //         code: `
        //   (function() {
        //     // Code to be executed in the context of the iframe
        //     console.log('Iframe content:', document.body.innerHTML);
        //   })();
        // `,
        //       })
        //     }
        //   })
        // } else {
        //   console.error('Iframe with id "i-unit" not found.')
        // }

        // if (iframe) {
        //   let tcElement = iframe.contentDocument.querySelector('div.tc-wrapper')
        //   console.log('tcElement4', tcElement)
        // }

        // intervalSubtitleRun = false
        // if (intervalSubtitleRun) {
        //   setTimeout(() => {
        //     checkIntervalSubtitle()
        //   }, INTERVAL_STEP + 100)
        // } else {
        //   checkIntervalSubtitle()
        // }

        // checkIntervalSubtitle()

        // console.log('wait...')
        // setTimeout(() => {
        //   console.log('run...')
        //   let firstChild = document.querySelector('.closed-captions')
        //   let bodyElement = document.querySelector('.video-wrapper')
        //   console.log('firstChild', firstChild)
        //   console.log('bodyElement', bodyElement)
        //   // // add div
        //   // const firstChild = document.querySelector('.closed-captions')
        //   // console.log('firstChild', firstChild)
        //   // if (firstChild) {
        //   //   const bodyElement = document.querySelector('.video-wrapper')
        //   //   const rootElement = document.createElement('div')
        //   //   console.log('bodyElement', bodyElement)
        //   //   console.log('rootElement', rootElement)
        //   //   rootElement.id = 'second-subtitle'
        //   //   // rootElement.className = 'horizontal-box'
        //   //   bodyElement.insertBefore(rootElement, firstChild)

        //   //   const root = createRoot(rootElement)
        //   //   root.render(<SecondSubtitle />)
        //   // }
        // }, 10000)
      } else {
        let lectureIconSvgElements = document.querySelectorAll(
          'a.btn.btn-link>svg'
        ) as NodeListOf<SVGElement>
        lectureIconSvgElements.forEach((element) => {
          if (element.style.color !== undefined) {
            element.style.removeProperty('color')
          }
          if (element.style.height !== undefined) {
            element.style.removeProperty('height')
          }
        })
        // lectureIconElement.style.color = 'rgb(69, 69, 69)'

        // // set more bigger
        // let lectureSvgElement = document.querySelector(
        //   'a[title="Lecture"] svg'
        // ) as HTMLElement
        // lectureSvgElement.style.height = '16px'
      }
      // a.active[title="Lecture"]
      // stop the interval
      intervalRun = false
      clearInterval(intervalId)
    } else if (activerCount >= ACTIVE_COUNT_MAX) {
      console.log('timeout ...')

      // stop the interval
      intervalRun = false
      clearInterval(intervalId)
    }
    console.log(` ${activerCount * INTERVAL_STEP} ms....`)
    activerCount++
  }, INTERVAL_STEP)
}

// function handleFrames(frames) {
//   frames.forEach((frame) => {
//     // Access the content of each iframe
//     const iframeContent = frame.contentDocument.body.innerHTML
//     console.log(`Content of iframe ${frame.id}:`, iframeContent)

//     // Modify the content of each iframe if needed
//     // frame.contentDocument.body.innerHTML = 'New content for the iframe';
//   })
// }

let intervalSubtitleRun = false
let activerSubtilleCount = 1
function checkIntervalSubtitle() {
  intervalSubtitleRun = true
  activerSubtilleCount = 1
  const intervalId = setInterval(() => {
    console.log(` ${activerSubtilleCount * INTERVAL_STEP} ms....`)

    let lectureElement = document.querySelector('.active.btn')
    console.log('lectureElement', lectureElement)

    // let iframe = document.querySelector(
    //   'iframe#unit-iframe'
    // ) as HTMLIFrameElement
    // console.log('iframeElement', iframe)
    // if (iframe) {
    //   let tcElement = iframe.contentDocument.querySelector('div.tc-wrapper')
    //   // let firstChild = iframe.contentDocument.querySelector(
    //   //   'div.closed-captions'
    //   // )
    //   // let bodyElement =
    //   // iframe.contentDocument.querySelector('div.video-wrapper')
    //   console.log('tcElement4', tcElement)
    //   // console.log('firstChild4', firstChild)
    //   // console.log('bodyElemen4', bodyElement)
    // }

    let iframe = document.querySelector(
      'iframe#unit-iframe'
    ) as HTMLIFrameElement

    console.log('iframeElement', iframe)

    if (iframe && iframe.contentDocument) {
      // Check if the iframe and its contentDocument are available
      let tcElement = iframe.contentDocument.querySelector('div.tc-wrapper')
      console.log('tcElement4', tcElement)
    } else {
      console.log('iframe or contentDocument is null')
    }

    activerSubtilleCount++
  }, INTERVAL_STEP)
}

// Function to handle link clicks
function handleLinkClick(event) {
  setTimeout(() => {
    console.log('=====================================')
    console.log('handleLinkClick :', event)
    console.log('baseURI :', event.target.baseURI)
    console.log('baseURI :', event.target.className)
    if (intervalRun) {
      setTimeout(() => {
        checkInterval()
      }, INTERVAL_STEP + 100)
    } else {
      checkInterval()
    }
  }, 600)
}

// Attach the click event listener to the entire document
document.addEventListener('click', handleLinkClick)

// // Create a MutationObserver instance
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     mutation.addedNodes.forEach((addedNode) => {
//       // Check if the added node is an <iframe> element
//       if (addedNode.tagName && addedNode.tagName.toLowerCase() === 'iframe') {
//         console.log('New iframe added:', addedNode)
//         // You can perform actions or attach listeners to the new iframe here
//       }
//     })
//   })
// })

// // Start observing the entire document for changes
// observer.observe(document, {
//   childList: true,
//   subtree: true,
// })

// // Create a MutationObserver instance
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     console.log('----1')
//     mutation.addedNodes.forEach((addedNode) => {
//       console.log('----2')
//       // Check if the added node is an Element and has the tagName property
//       if (addedNode instanceof Element && addedNode.tagName) {
//         console.log('----3')
//         // Check if the added node is an <iframe> element
//         if (addedNode.tagName.toLowerCase() === 'iframe') {
//           console.log('New iframe added:', addedNode)
//           // You can perform actions or attach listeners to the new iframe here
//         }
//       }
//     })
//   })
// })

// // Start observing the entire document for changes
// observer.observe(document, {
//   childList: true,
//   subtree: true,
// })

// content.js

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOMContentLoaded.....')
  // Query all frames in the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabId = tabs[0].id

    // Get all frames in the tab
    chrome.webNavigation.getAllFrames({ tabId: tabId }, function (details) {
      handleFrames(details)
    })
  })
})

function handleFrames(frames) {
  frames.forEach((frame) => {
    const iframeContent = frame.contentDocument.body.innerHTML
    console.log(`Content of iframe ${frame.id}:`, iframeContent)
  })
}

// add injected
const script = document.createElement('script')
script.src = chrome.runtime.getURL('injected.js')
document.body.appendChild(script)

window.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'getIframeContent') {
    // Access the iframe content
    // const iframeContent = event.source.document.body.innerHTML;
    console.log('iframeContent event', event)
  }
})
