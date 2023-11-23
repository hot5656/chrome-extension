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
  activerCount = 0
  const intervalId = setInterval(() => {
    let iframeElement = document.querySelector('iframe#unit-iframe')
    if (iframeElement) {
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

        console.log('wait...')
        setTimeout(() => {
          console.log('run...')
          let firstChild = document.querySelector('.closed-captions')
          let bodyElement = document.querySelector('.video-wrapper')
          console.log('firstChild', firstChild)
          console.log('bodyElement', bodyElement)
          // // add div
          // const firstChild = document.querySelector('.closed-captions')
          // console.log('firstChild', firstChild)
          // if (firstChild) {
          //   const bodyElement = document.querySelector('.video-wrapper')
          //   const rootElement = document.createElement('div')
          //   console.log('bodyElement', bodyElement)
          //   console.log('rootElement', rootElement)
          //   rootElement.id = 'second-subtitle'
          //   // rootElement.className = 'horizontal-box'
          //   bodyElement.insertBefore(rootElement, firstChild)

          //   const root = createRoot(rootElement)
          //   root.render(<SecondSubtitle />)
          // }
        }, 10000)
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
