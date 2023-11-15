import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'

chrome.storage.sync.get(['doubleTitleUdemy'], (storage) => {
  if (
    storage.doubleTitleUdemy &&
    ['www.coursera.org'].includes(window.location.host)
  ) {
    console.log('found udemy....')
  }
})

function App() {
  function handleSubtitleFileChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile) {
      const reader = new FileReader()

      reader.onload = function (e) {
        const vttData = e.target.result
        const subtitleUrl = URL.createObjectURL(event.target.files[0])

        console.log('subtitleUrl:', subtitleUrl)

        let trackElement = document.querySelector(
          'track[srclang="en"]'
        ) as HTMLTrackElement
        if (trackElement) {
          trackElement.src = subtitleUrl
          console.log('trackElement:', trackElement)
        }
      }

      reader.readAsText(selectedFile)
    }
  }

  return (
    // <div id="insert-div">
    <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
    // </div>
  )
}

// add load div
function addUploadDiv() {
  // const firstChild = document.querySelector('.rc-Course')
  const firstChild = document.querySelector('.align-items-vertical-center')
  console.log('firstChild', firstChild)
  if (firstChild) {
    // const bodyElement = document.querySelector('.rc-MetatagsWrapper')
    const bodyElement = document.querySelector('.c-container')
    const rootElement = document.createElement('div')
    rootElement.id = 'insert-div'
    console.log(bodyElement)
    console.log(rootElement)
    bodyElement.insertBefore(rootElement, firstChild)

    const root = createRoot(rootElement)
    root.render(<App />)
  }
}
// const topElement = document.querySelector('#fb-root')
// if (topElement) {
//   const bodyElement = document.body
//   const rootElement = document.createElement('div')
//   // bodyElement.insertBefore(rootElement, firstChild)
//   bodyElement.appendChild(rootElement)

//   const root = createRoot(bodyElement)
//   root.render(<App />)
// }

let timer = 0
let languages = []
window.addEventListener('load', function () {
  console.log('contentScript load...')
  let languageElements = document.querySelectorAll('video track')
  console.log(timer, 'languageElements:', languageElements)
  for (let element of languageElements) {
    console.log(typeof element, element)
  }

  const intervalId = setInterval(() => {
    let videoElement = document.querySelector('video')
    if (videoElement) {
      console.log('found videoElement :', typeof videoElement)
      console.log(videoElement.ariaLabel)

      let sourceElements = document.querySelectorAll('video source')
      console.log(sourceElements)
      for (let source of sourceElements as NodeListOf<HTMLTrackElement>) {
        console.log(source.src)
      }
    }
    let languageElements = document.querySelectorAll('video track')
    timer = timer + 1000
    for (let element of languageElements as NodeListOf<HTMLTrackElement>) {
      languages.push({ language: element.srclang, src: element.src })
    }
    if (languages.length > 0) {
      addUploadDiv()
      console.log(languages)
      // stop the interval
      clearInterval(intervalId)
    }
  }, 1000)
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'download chinese subtitle') {
    sendResponse({ message: 'receive download chinese subtitle' })
    DownloadChineseSubtitle()
  }
})

function DownloadChineseSubtitle() {
  let index = languages.findIndex((item) => item.language === 'zh-CN')
  if (index !== -1) {
    console.log(languages[index])
    downloadChinesetitle(languages[index].src)
  } else {
    console.log('not found zh-CN')
  }
}

function downloadChinesetitle(subtitleUri) {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', subtitleUri, false)
  xhr.send()
  if (xhr.status === 200) {
    console.log(xhr.responseText)
    chrome.runtime.sendMessage({
      message: 'chinese subtitle',
      title: 'coursera_chinese',
      subtitle: xhr.responseText,
    })
  } else {
    throw new Error('Network response was not ok')
  }
}
