// contentScript.js

// Include React (make sure it's bundled and available in your extension)
import React, { useState } from 'react'
// import ReactDOM from 'react-dom'
import ReactDOM from 'react-dom/client'

let talkId = ''
let titleUrl = []
let videoUrl = ''
let vttUrl = ''
let vttStartMs = 0
let countString = 'Counter:'

// Your React component
function App() {
  let raw = null
  let data = null
  let playerData = null
  const [downcounter, setDowncounter] = useState<number>(0)

  const subDivStyle = {
    display: 'inline-block',
    margin: '10px 20px',
    backgroundColor: 'red',
    color: 'white',
    padding: '5px 16px',
    borderRadius: '40px',
  }

  // change paddingTop
  const mainElement = document.querySelector('main#maincontent') as HTMLElement
  mainElement.style.paddingTop = '7rem'

  // get talkId, titleUrl, videoUrl
  raw = document.querySelector('#__NEXT_DATA__').textContent
  if (raw) {
    data = JSON.parse(raw)
    // console.log('data:', data)
    if (data) {
      if ('videoData' in data.props.pageProps) {
        playerData = JSON.parse(data.props.pageProps.videoData.playerData)
        // console.log('playerData:', playerData)
        talkId = data.props.pageProps.videoData.id
        titleUrl = playerData.canonical.split('/')
        videoUrl = playerData.resources.h264[0].file
      }
    }
  }
  // get vttUrl
  if (document.querySelector('video track')) {
    vttUrl = document.querySelector('video track').getAttribute('src')
  }
  console.log('talkId get :', talkId)

  // get vtt start ms
  vttStartMs = getVttOffsetMs(vttUrl)

  function updateCountDown(count) {
    setDowncounter(count)
    console.log(`updateCountDown -> ${countString} ${count}`)
  }

  return (
    <div id="insert-div">
      <div id="load-countdown" style={subDivStyle}>
        {countString} {downcounter}
      </div>
      <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
    </div>
  )
}

// Event handler to handle file selection
function handleSubtitleFileChange(event) {
  const selectedFile = event.target.files[0]

  if (selectedFile) {
    // Handle the selected file, e.g., read its contents
    const reader = new FileReader()

    reader.onload = function (e) {
      const vttData = e.target.result
      const subtitleUrl = URL.createObjectURL(event.target.files[0])

      let trackElement = document.querySelector(
        'track[srclang="en"]'
      ) as HTMLTrackElement
      if (!trackElement) {
        trackElement = document.querySelector(
          'track[kind="subtitles"]'
        ) as HTMLTrackElement
      }
      trackElement.src = subtitleUrl

      // Now you can use vttData, which contains the content of the selected .vtt file
      // You can then proceed to update your video's subtitles as needed
    }

    reader.readAsText(selectedFile)
  }
}

function getTedSubtitle(id) {
  let xhr = new XMLHttpRequest()
  let subtitles = []

  xhr.open('GET', `https://www.ted.com/talks/subtitles/id/${id}/lang/en`, false)
  xhr.send()

  if (xhr.status === 200) {
    let data = JSON.parse(xhr.responseText)
    subtitles = data.captions
  } else {
    throw new Error('Network response was not ok')
  }
  return subtitles
}

function getVttOffsetMs(vtt) {
  let xhr = new XMLHttpRequest()
  let vttMs = 0

  if (vttUrl !== '') {
    xhr.open('GET', vtt, false)
    xhr.send()

    if (xhr.status === 200) {
      let lines = xhr.responseText.split('\n')
      if (lines.length >= 3) {
        vttMs = Number(
          lines[2].replace(/\./g, '').split('-->')[0].split(':')[2]
        )
        console.log('vttStartMs :', vttMs)
      }
    } else {
      throw new Error('Network response was not ok')
    }
  }
  return vttMs
}

function add2ndSubtitle(subtitles) {
  let language_code = 'zh-Hant'
  let subtitlelines = subtitles.length

  updateCountDown(subtitlelines)
  subtitles.forEach(function (title, index) {
    let newWords = ''
    let originalWords = title.content
    let xhr = new XMLHttpRequest()

    if (title.content.includes('%')) {
      title.content = title.content.replace(/%/g, 'percent')
    }

    xhr.open(
      'GET',
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${title.content}`,
      false
    )
    xhr.send()

    if (xhr.status === 200) {
      let data = JSON.parse(xhr.responseText)
      newWords = data[0][0][0]
      subtitles[index].content = newWords + '\n' + originalWords
      if (index % 10 == 0) {
        updateCountDown(subtitlelines - index)
        console.log(newWords)
      }
    } else {
      throw new Error('Network response was not ok')
    }
  })
  updateCountDown(0)

  return subtitles
}

const headElemnet = document.querySelector('header')
const rootElement = document.createElement('div')
headElemnet.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)

function triggerGenerateSubtitle() {
  let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''

  let dualSubtitle = add2ndSubtitle(getTedSubtitle(talkId))
  console.log('title : ', title)
  console.log(dualSubtitle)

  // send subtitle to background.js
  chrome.runtime.sendMessage({
    message: 'subtitle',
    title: title,
    idTalk: talkId,
    subtitle: dualSubtitle,
    vttStartMs: vttStartMs,
  })
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'generate subtitle') {
    sendResponse({ talkId: talkId })
    console.log('Message received in content script:', message)
    if (talkId !== '') {
      triggerGenerateSubtitle()
    }
  }
})
