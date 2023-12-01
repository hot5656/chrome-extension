import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import { SHOW_ACTIVE, LANGUGAES_INFO, UDAL_MODE } from '../utils/messageType'

let ACTIVE_COUNT_MAX = 10
let INTERVAL_STEP = 1000

let activerCount = 1
let intervalRun = false
let language_code = 'zh-Hant'

function NewVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const preIndex = useRef<number>(0)
  const subtitleContainerRef = useRef<HTMLParagraphElement>(null)
  const [subtitles, setSubtitles] = useState<
    { timeStart: number; timeEnd: number; text: string }[]
  >([])

  // const subtitleContainer = subtitleContainerRef.current

  const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target
    const selectedFile = fileInput.files?.[0]

    if (selectedFile) {
      const videoElement = videoRef.current

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
    const hoursAsSeconds = parseInt(hours) * 360
    const minutesAsSeconds = parseInt(minutes) * 60
    const secondsWithTenths = parseFloat(seconds)

    // Combine minutes and seconds
    return parseFloat(
      (hoursAsSeconds + minutesAsSeconds + secondsWithTenths).toFixed(3)
    )
  }

  const parseSubtitleContent = (subtitleContent: string) => {
    // Example: assuming each subtitle is separated by a newline character
    const subtitleLines = subtitleContent.split('\n')

    console.log('subtitleLines:', subtitleLines)

    // Assuming each subtitle consists of two lines: timing and text
    const parsedSubtitles = []
    let isTime = false
    let timeStart = 0
    let timeEnd = 0
    let text = ''
    let textCount = 1
    for (let i = 1; i < subtitleLines.length; i++) {
      if (subtitleLines[i].includes('-->')) {
        if (isTime) {
          parsedSubtitles.push({ timeStart: timeStart, timeEnd: timeEnd, text })
        }

        timeStart = timeToSecond(subtitleLines[i].split(' ')[0])
        timeEnd = timeToSecond(subtitleLines[i].split(' ')[2])
        isTime = true
        textCount = 1
        text = ''
      } else if (subtitleLines[i].length > 0) {
        if (textCount === 1) {
          text = subtitleLines[i]
        } else {
          text = text + '\n' + subtitleLines[i]
        }
        textCount++
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

    // Get the current playback time
    const currentTime = videoElement.currentTime

    console.log('Current Time:', currentTime)

    const index = subtitles.findIndex(
      (subtitle) =>
        currentTime >= subtitle.timeStart && currentTime <= subtitle.timeEnd
    )
    if (index !== preIndex.current) {
      console.log(`subtitles[${index}]=`, subtitles[index])
      let currentSubtitle = index !== -1 ? subtitles[index].text : ''

      if (currentSubtitle.length != 0) {
        let tempSubtitle = currentSubtitle
        if (tempSubtitle.includes('%')) {
          tempSubtitle = tempSubtitle.replace(/%/g, 'percent')
        }

        let xhr = new XMLHttpRequest()
        xhr.open(
          'GET',
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${tempSubtitle}`,
          false
        )
        xhr.send()

        if (xhr.status === 200) {
          let data = JSON.parse(xhr.responseText)
          let newWords = data[0][0][0]
          currentSubtitle = newWords + '\n' + currentSubtitle
        } else {
          throw new Error('Network response was not ok')
        }
      }

      subtitleContainer.innerText = currentSubtitle
    } else {
      console.log('index=', index)
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
      vtt load :{' '}
      <input
        className="load-item"
        type="file"
        accept=".vtt"
        onChange={handleSubtitleFileChange}
      />
      <div id="video-show">
        <video id="my-video" controls width="100%" ref={videoRef}></video>
        <p id="subtitle-text" ref={subtitleContainerRef}></p>
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
  checkInterval()
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
        lectureSvgElement.style.color = 'red'

        addNewVideo()

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
