import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import {
  MESSAGE_SUBTITLE_MODE,
  MESSAGE_2ND_LANGUAGE,
  SUBTITLE_MODE,
  SUBTITLE_MODE_OFF,
  SUBTITLE_MODE_SINGLE,
  SUBTITLE_MODE_DUAL,
  SECOND_LANGUES_TRADITIONAL,
  SECOND_LANGUES,
} from '../utils/messageType'

let ACTIVE_COUNT_MAX = 10
let INTERVAL_STEP = 1000

let activerCount = 1
let intervalRun = false
let secondLanguage = SECOND_LANGUES[SECOND_LANGUES_TRADITIONAL].value
let subtitleMode = SUBTITLE_MODE[SUBTITLE_MODE_DUAL]

function NewVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const preIndex = useRef<number>(0)
  const subtitleContainerRef = useRef<HTMLParagraphElement>(null)
  const [subtitles, setSubtitles] = useState<
    { timeStart: number; timeEnd: number; text: string }[]
  >([])

  // load mp4
  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target
    const selectedFile = fileInput.files?.[0]

    if (selectedFile) {
      const videoElement = videoRef.current

      // show video and button
      const showElement = document.getElementById('video-show') as HTMLElement
      const buttonElement = document.getElementById(
        'full-screen-btn'
      ) as HTMLElement
      showElement.style.display = 'block'
      buttonElement.style.display = 'inline-block'

      // Create a Blob URL for the selected video file
      const blobURL = URL.createObjectURL(selectedFile)

      // Set the Blob URL as the source for the video
      if (videoElement) {
        videoElement.src = blobURL

        // Load the new source
        videoElement.load()
      }
    }
  }

  // load sub title
  const handleSubtitleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const fileInput = event.target
    const selectedFile = fileInput.files?.[0]

    if (selectedFile) {
      const videoElement = videoRef.current
      const subtitleContainer = subtitleContainerRef.current

      // Read the subtitle file content
      const subtitleContent = await selectedFile.text()

      // Parse the subtitle content
      const parsedSubtitles = parseSubtitleContent(subtitleContent)
      console.log('Parsed Subtitles:', parsedSubtitles)

      // Set subtitles state
      setSubtitles(parsedSubtitles)

      // Load the new source
      if (videoElement) {
        videoElement.load()
      }
    }
  }

  function timeToSecond(timeString) {
    const [hours, minutes, seconds] = timeString.split(':')

    // Convert minutes and seconds to numbers
    const hoursAsSeconds = parseInt(hours) * 3600
    const minutesAsSeconds = parseInt(minutes) * 60
    const secondsWithTenths = parseFloat(seconds.replace(/,/g, '.'))

    // Combine minutes and seconds
    return parseFloat(
      (hoursAsSeconds + minutesAsSeconds + secondsWithTenths).toFixed(3)
    )
  }

  const parseSubtitleContent = (subtitleContent: string) => {
    const subtitleLines = subtitleContent.split('\n')
    console.log('subtitleLines:', subtitleLines)

    // Assuming each subtitle consists of two lines: timing and text
    const parsedSubtitles = []
    let isTime = false
    let timeStart = 0
    let timeEnd = 0
    let text = ''
    let textCount = 1
    let isData = false
    for (let i = 0; i < subtitleLines.length; i++) {
      if (subtitleLines[i].includes('-->')) {
        if (isTime) {
          parsedSubtitles.push({ timeStart: timeStart, timeEnd: timeEnd, text })
        }

        let tiemInfo = subtitleLines[i].split(' ')
        timeStart = timeToSecond(tiemInfo[0])
        timeEnd = timeToSecond(tiemInfo[2])
        isTime = true
        isData = true
        textCount = 1
        text = ''
      } else if (subtitleLines[i].length == 0) {
        isData = false
      } else if (subtitleLines[i].length > 0) {
        if (isData) {
          if (textCount === 1) {
            text = subtitleLines[i]
          } else {
            text = text + ' ' + subtitleLines[i]
          }
          textCount++
        }
      }
    }

    if (isTime && textCount > 1) {
      parsedSubtitles.push({ timeStart: timeStart, timeEnd: timeEnd, text })
    }

    console.log('parsedSubtitles : ', parsedSubtitles)

    return parsedSubtitles
  }

  const handleTimeUpdate = () => {
    const videoElement = videoRef.current
    const subtitleContainer = subtitleContainerRef.current

    if (!videoElement || !subtitleContainer) return

    if (subtitleOffControl(subtitleMode)) {
      return
    }

    // Get the current playback time
    const currentTime = videoElement.currentTime
    // console.log('Current Time:', currentTime)

    const index = subtitles.findIndex(
      (subtitle) =>
        currentTime >= subtitle.timeStart && currentTime <= subtitle.timeEnd
    )
    if (index !== preIndex.current) {
      console.log(`subtitles[${index}]=`, subtitles[index])
      let currentSubtitle = index !== -1 ? subtitles[index].text : ''

      if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_DUAL]) {
        if (currentSubtitle.length != 0) {
          let tempSubtitle = currentSubtitle
          if (tempSubtitle.includes('%')) {
            tempSubtitle = tempSubtitle.replace(/%/g, 'percent')
          }

          let xhr = new XMLHttpRequest()
          xhr.open(
            'GET',
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${secondLanguage}&dt=t&q=${tempSubtitle}`,
            false
          )
          xhr.send()

          console.log(
            'ask : ',
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${secondLanguage}&dt=t&q=${tempSubtitle}`
          )
          if (xhr.status === 200) {
            let data = JSON.parse(xhr.responseText)
            let newWords = data[0][0][0]
            console.log('newWords', newWords)
            currentSubtitle = newWords + '\n' + currentSubtitle
          } else {
            throw new Error('Network response was not ok')
          }
        }
      }

      subtitleContainer.innerText = currentSubtitle
    } else {
      // console.log('index=', index)
    }

    preIndex.current = index
  }

  useEffect(() => {
    const videoElement = videoRef.current

    // Add event listener for time updates
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate)
    }

    // Clean up event listener when the component is unmounted
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [subtitles])

  const handleFullScreen = () => {
    videoShowFullScreen()
  }

  const handleSeekBackward = () => {
    const videoElement = document.getElementById('my-video') as HTMLVideoElement
    videoElement.currentTime -= 5
  }

  const handleSeekForward = () => {
    const videoElement = document.getElementById('my-video') as HTMLVideoElement
    videoElement.currentTime += 5
  }

  return (
    <>
      mp4 load :{' '}
      <input
        className="load-item"
        type="file"
        accept="video/mp4"
        onChange={handleVideoFileChange}
      />
      <br />
      <button id="full-screen-btn" onClick={handleFullScreen}>
        Full Screen
      </button>
      srt load :{' '}
      <input
        className="load-item"
        type="file"
        accept=".srt"
        onChange={handleSubtitleFileChange}
      />
      <div id="video-show">
        <video id="my-video" controls width="100%" ref={videoRef}></video>
        <p id="subtitle-text" ref={subtitleContainerRef}></p>
        <div id="custom-controls">
          <button id="backward-button" onClick={handleSeekBackward}>
            &#9666; 5s
          </button>
          <button id="forward-button" onClick={handleSeekForward}>
            5s &#9656;
          </button>
        </div>
      </div>
    </>
  )
}

function addNewVideo() {
  const newVideoElement = document.querySelector('#new-video')
  if (!newVideoElement) {
    const unitElement = document.querySelector('.unit-iframe-wrapper')
    if (unitElement) {
      const parentElement = document.querySelector('.unit')
      const renewVideoElement = document.createElement('div')
      renewVideoElement.id = 'new-video'
      parentElement.insertBefore(renewVideoElement, unitElement)

      const root = createRoot(renewVideoElement)
      root.render(<NewVideo />)
    }
  }
}

window.addEventListener('load', function () {
  console.log('contentScript load...')
  chrome.storage.sync.get(['subtitleModeEdx', 'language2ndEdx'], (res) => {
    if (res.subtitleModeEdx) {
      subtitleMode = res.subtitleModeEdx
    }

    if (res.language2ndEdx) {
      secondLanguage = res.language2ndEdx
    }
  })

  checkInterval()
  initFullScreen()
})

function checkInterval() {
  intervalRun = true
  activerCount = 1
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
        // lectureSvgElement.style.color = 'red'

        addNewVideo()
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

function initFullScreen() {
  const intervalId = setInterval(() => {
    const videoShow = document.getElementById('video-show')
    if (videoShow) {
      const myVideo = document.getElementById('my-video')

      myVideo.addEventListener('click', function () {
        // video click fullscreen
        console.log('click full screen')
        videoShowFullScreen()
      })

      document.addEventListener('fullscreenchange', function () {
        // The fullscreenchange event can sometimes fire more than once in certain browsers when requesting fullscreen.
        // 	1. First when fullscreen is requested
        // 	2. Second when fullscreen is exited

        console.log('document.fullscreenElement : ', document.fullscreenElement)

        if (document.fullscreenElement === myVideo) {
          console.log('fullscreenchange')

          if (document.fullscreenElement) {
            console.log('exitFullscreen..')
            document.exitFullscreen()
          }
        }
        if (!document.fullscreenElement) {
          const videoShow = document.getElementById('video-show')
          videoShow.classList.remove('fullscreen')
        }
      })

      console.log(videoShow)
      console.log(myVideo)

      clearInterval(intervalId)
    } else {
      console.log('no video-show....')
    }
  }, INTERVAL_STEP)
}

function videoShowFullScreen() {
  const videoShow = document.getElementById('video-show')
  videoShow.classList.add('fullscreen')

  if (videoShow.requestFullscreen) {
    videoShow.requestFullscreen()
    // @ts-ignore
  } else if (videoShow.mozRequestFullScreen) {
    /* Firefox */
    // @ts-ignore
    videoShow.mozRequestFullScreen()
    // @ts-ignore
  } else if (videoShow.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    // @ts-ignore
    videoShow.webkitRequestFullscreen()
    // @ts-ignore
  } else if (videoShow.msRequestFullscreen) {
    /* IE/Edge */
    // @ts-ignore
    videoShow.msRequestFullscreen()
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === MESSAGE_SUBTITLE_MODE) {
    sendResponse({ message: MESSAGE_SUBTITLE_MODE })
    subtitleMode = message.subtitleMode
    subtitleOffControl(subtitleMode)
  } else if (message.message === MESSAGE_2ND_LANGUAGE) {
    sendResponse({ message: MESSAGE_2ND_LANGUAGE })
    secondLanguage = message.secondLanguage
  }
  console.log('message', message)
})

function subtitleOffControl(subtitleMode) {
  let isOff = false
  const videoTitle = document.getElementById('subtitle-text') as HTMLElement
  const videoTitletyle = window.getComputedStyle(videoTitle)
  if (subtitleMode === SUBTITLE_MODE[SUBTITLE_MODE_OFF]) {
    // @ts-ignore
    if (!videoTitletyle.style) {
      videoTitle.style.display = 'none'
    }
    isOff = true
    // return
  } else {
    // @ts-ignore
    if (videoTitle.style) {
      videoTitle.style.removeProperty('display')
    }
  }
  return isOff
}
