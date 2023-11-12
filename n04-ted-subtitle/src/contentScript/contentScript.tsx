// contentScript.js

// Include React (make sure it's bundled and available in your extension)
import React, { useState, useEffect, useRef } from 'react'
// import ReactDOM from 'react-dom'
import ReactDOM from 'react-dom/client'

let talkId = ''
let titleUrl = []
// let videoUrl = ''
let vttUrl = ''
let vttStartMs = 0
let countString = 'Download Count:'
let languageType = 'zh-Hant'

// Your React component
function App() {
  let raw = null
  let data = null
  let playerData = null
  const [downcounter, setDowncounter] = useState<number>(0)
  const [downcounterTemp, setDowncounterTemp] = useState<number>(-1)
  const [talkIdState, setTalkIdState] = useState<string>('')
  const subtitles = useRef([])
  const subtitlesLength = useRef(0)
  const subtitlesIndex = useRef(0)
  const loadComplete = useRef<boolean>(false)

  const subDivStyle = {
    display: 'inline-block',
    margin: '10px 20px',
    backgroundColor: 'red',
    color: 'white',
    padding: '5px 16px',
    borderRadius: '40px',
  }

  useEffect(() => {
    // This code will run only on the initial render.
    bootcode()
  }, [])

  useEffect(() => {
    // console.log('downcounter(useEffect):', downcounter)
    if (subtitlesIndex.current != 0) {
      if (subtitlesIndex.current < subtitlesLength.current) {
        // console.log('subtitlesIndex.current:', subtitlesIndex.current)
        add2ndSubtitle()
      }
    }

    if (loadComplete.current) {
      // send subtitle to background.js
      let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''
      chrome.runtime.sendMessage({
        message: 'dual subtitle',
        title: title,
        idTalk: talkId,
        subtitle: subtitles.current,
        vttStartMs: vttStartMs,
        languageType: languageType,
      })

      loadComplete.current = false
      subtitlesIndex.current = 0
    }
  }, [downcounter])

  function bootcode() {
    // change paddingTop
    const mainElement = document.querySelector(
      'main#maincontent'
    ) as HTMLElement
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
          setTalkIdState(talkId)
          titleUrl = playerData.canonical.split('/')
          // videoUrl = playerData.resources.h264[0].file
        }
      }
    }
    console.log('talkId get :', talkId)
  }

  function showCurrentTime() {
    const currentDateTime = new Date()
    const currentDateTimeString = currentDateTime.toISOString()
    console.log(currentDateTimeString)
  }

  function updateCountDown(count) {
    showCurrentTime()
    setDowncounterTemp(count)
    // downCounter = count
    console.log(`updateCountDown,  -> ${countString} ${count}`)
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

        console.log('subtitleUrl:', subtitleUrl)
        let trackElement = document.querySelector(
          'track[srclang="en"]'
        ) as HTMLTrackElement
        if (trackElement) {
          trackElement.src = subtitleUrl
          console.log('trackElement:', trackElement)
        } else {
          trackElement = document.querySelector(
            'track[kind="subtitles"]'
          ) as HTMLTrackElement
          if (trackElement) {
            trackElement.src = subtitleUrl
            console.log('trackElement:', trackElement)
          }
        }

        // Now you can use vttData, which contains the content of the selected .vtt file
        // You can then proceed to update your video's subtitles as needed
      }

      reader.readAsText(selectedFile)
    }
  }

  function getTedSubtitle(id) {
    let xhr = new XMLHttpRequest()

    xhr.open(
      'GET',
      `https://www.ted.com/talks/subtitles/id/${id}/lang/en`,
      false
    )
    xhr.send()

    if (xhr.status === 200) {
      let data = JSON.parse(xhr.responseText)
      subtitles.current = data.captions
      subtitlesLength.current = data.captions.length
      // console.log(subtitles)
    } else {
      throw new Error('Network response was not ok')
    }

    // let subtitlelines = subtitles.length

    setDowncounter(subtitles.current.length)
  }

  function add2ndSubtitle() {
    // let language_code = 'zh-Hant'
    let count = subtitlesIndex.current
    let length = subtitlesLength.current

    // console.log(`start count=${count}`)
    while (count < length) {
      let newWords = ''
      let originalWords = subtitles.current[count].content
      let xhr = new XMLHttpRequest()

      if (subtitles.current[count].content.includes('%')) {
        subtitles.current[count].content = subtitles.current[
          count
        ].content.replace(/%/g, 'percent')
      }

      xhr.open(
        'GET',
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${languageType}&dt=t&q=${subtitles.current[count].content}`,
        false
      )
      xhr.send()

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText)
        newWords = data[0][0][0]
        subtitles.current[count].content = newWords + '\n' + originalWords
        count = count + 1
        subtitlesIndex.current = count
        if (count % 10 == 1) {
          // console.log(`${count - 1}:`, subtitles.current[count - 1].content)
          break
        }
      } else {
        throw new Error('Network response was not ok')
      }
    }
    setDowncounter(length - subtitlesIndex.current)
    if (length - subtitlesIndex.current == 0) {
      loadComplete.current = true
    }
    // console.log(
    //   'length, subtitlesIndex.current,  length - subtitlesIndex.current',
    //   length,
    //   subtitlesIndex.current,
    //   length - subtitlesIndex.current
    // )
  }

  function handleGenerateSubtitle() {
    let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''
    getTedSubtitle(talkId)
    add2ndSubtitle()
  }

  function handleDownloadEnglishSubtitle() {
    // let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''
    // getTedSubtitle(talkId)
    // console.log(subtitles.current)
    let xhr = new XMLHttpRequest()
    if (vttUrl !== '') {
      xhr.open('GET', vttUrl, false)
      xhr.send()

      if (xhr.status === 200) {
        let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''
        // console.log(xhr.responseText)

        chrome.runtime.sendMessage({
          message: 'english subtitle',
          title: title,
          idTalk: talkId,
          subtitle: xhr.responseText,
        })
      } else {
        throw new Error('Network response was not ok')
      }
    }
  }

  return (
    <>
      {talkIdState != '' && (
        <div id="insert-div">
          <button
            id="generate-subtitle"
            onClick={handleGenerateSubtitle}
          ></button>
          <button
            id="download-english-subtitle"
            onClick={handleDownloadEnglishSubtitle}
          ></button>
          <div id="load-countdown" style={subDivStyle}>
            {countString}
            {downcounter}
          </div>
          <input
            type="file"
            accept=".vtt"
            onChange={handleSubtitleFileChange}
          />
        </div>
      )}
    </>
  )
}

const headElemnet = document.querySelector('#__next div')
const rootElement = document.createElement('div')
const firstChild = headElemnet.firstChild
headElemnet.insertBefore(rootElement, firstChild)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'generate subtitle') {
    languageType = message.languageType
    getVttUrl()
    sendResponse({ talkId: talkId, vttUrl: vttUrl })
    console.log('Message received in content script:', message)
    if (talkId !== '' && vttUrl !== '') {
      const buttonElement = document.getElementById('generate-subtitle')

      if (buttonElement) {
        buttonElement.click()
      }
    }
  } else if (message.message === 'download english subtitle') {
    getVttUrl()
    sendResponse({ talkId: talkId, vttUrl: vttUrl })
    console.log('Message received in content script:', message)
    if (talkId !== '' && vttUrl !== '') {
      const buttonElement = document.getElementById('download-english-subtitle')
      if (buttonElement) {
        buttonElement.click()
      }
    }
  } else if (message.message === 'update fontsize') {
    const videoElement = document.querySelector('#video')
    let fontSize = message.fontSize

    videoElement.classList.remove('video-24')
    videoElement.classList.remove('video-32')
    videoElement.classList.remove('video-40')
    if (fontSize !== 'video-16') {
      videoElement.classList.add(fontSize)
      // console.log('--- add class --->', fontSize)
    }
  }
})

function getVttUrl() {
  // get vttUrl
  if (document.querySelector('video track')) {
    vttUrl = document.querySelector('video track').getAttribute('src')
    // get vtt start ms
    vttStartMs = getVttOffsetMs(vttUrl)
    console.log(vttUrl)
  }
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

window.addEventListener('load', function () {
  // console.log("window.addEventListener('load')...")

  const videoElement = document.querySelector('#video')
  if (videoElement) {
    chrome.storage.sync.get(['fontSizeTed'], (res) => {
      const fontSize = res.fontSizeTed ?? 'video-16'
      if (res.fontSizeTed) {
        if (res.fontSizeTed !== 'video-16') {
          videoElement.classList.add(res.fontSizeTed)
          console.log('--- add class --->', res.fontSizeTed)
        }
      }
    })
  }
})
