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
      }
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
