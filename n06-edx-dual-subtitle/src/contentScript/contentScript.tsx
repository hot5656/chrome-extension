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

    // console.log('Current Time:', currentTime)

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
    // let videoShow = document.getElementById('video-show')
    // videoShow.requestFullscreen()
    // videoShowFullScreen()
    triggeeClick()
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
      <button id="full-screen" onClick={handleFullScreen}>
        Full Screen
      </button>
      vtt load :{' '}
      <input
        className="load-item"
        type="file"
        accept=".vtt"
        onChange={handleSubtitleFileChange}
      />
      <div id="video-show">
        <video id="my-video" controls width="100%" ref={videoRef}></video>
        <div id="subtitle-container">
          <p id="subtitle-text" ref={subtitleContainerRef}></p>
        </div>
        {/* <p id="subtitle-text" ref={subtitleContainerRef}></p> */}
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

// const videoElement = document.getElementById('my-video')
// const subtitleContainer = document.getElementById('subtitle-container')

// document.addEventListener('fullscreenchange', () => {
//   adjustSubtitlePosition()
// })

// function adjustSubtitlePosition() {
//   // Implement your logic to adjust subtitle positioning
// }

// addNewVideo()
// let isVirtualFullscreen = false
let isVideoFullexit = false
// let handledChange = true
function initFullScreen() {
  const intervalId = setInterval(() => {
    const videoShow = document.getElementById('video-show')
    if (videoShow) {
      const myVideo = document.getElementById('my-video')

      myVideo.addEventListener('click', function () {
        // Toggle fullscreen mode
        console.log(
          'click-Toggle fullscreen mode..........................................'
        )
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
            // document.exitFullscreen()
          }
          isVideoFullexit = true
          // if (handledChange) {

          // isVirtualFullscreen = !isVirtualFullscreen
          // console.log('isVirtualFullscreen', isVirtualFullscreen)
          // let videoShow = document.getElementById('video-show')
          // videoShow.requestFullscreen()

          // @ts-ignore
          // videoShow.fullscreenElement()
          // videoShow.classList.toggle('fullscreen')
          // }
          // handledChange = !handledChange
        }

        if (!document.fullscreenElement && isVideoFullexit) {
          isVideoFullexit = false
          // triggeeClick()
          // buttonClick()
          console.log('wait trigger..')
          const myVideo = document.getElementById('my-video')
          myVideo.click()
        }
      })

      {
        // const videoElement = document.getElementById('my-video')
        // videoElement.addEventListener('click', () => {
        //   videoShowFullScreen()
        // })
        // const videoContainer = document.getElementById('video-show')
        // const videoElement = document.getElementById('my-video')
        // videoElement.addEventListener('click', () => {
        //   videoShowFullScreen()
        // if (videoContainer.requestFullscreen) {
        //   videoContainer.requestFullscreen()
        //   // @ts-ignore
        // } else if (videoContainer.mozRequestFullScreen) {
        //   /* Firefox */
        //   // @ts-ignore
        //   videoContainer.mozRequestFullScreen()
        //   // @ts-ignore
        // } else if (videoContainer.webkitRequestFullscreen) {
        //   /* Chrome, Safari and Opera */
        //   // @ts-ignore
        //   videoContainer.webkitRequestFullscreen()
        //   // @ts-ignore
        // } else if (videoContainer.msRequestFullscreen) {
        //   /* IE/Edge */
        //   // @ts-ignore
        //   videoContainer.msRequestFullscreen()
        // }
        // })
      }
      // document.addEventListener('fullscreenchange', () => {
      //   console.log('fullscreenchange2 : ', document.fullscreenElement)
      //   // if (document.fullscreenElement) {
      //   //   videoShow.classList.add('fullscreen')
      //   //   myVideo.classList.add('fullscreen')
      //   // } else {
      //   //   videoShow.classList.remove('fullscreen')
      //   //   myVideo.classList.remove('fullscreen')
      //   // }
      // })

      // // Toggle fullscreen mode when clicking on the video
      // myVideo.addEventListener('click', () => {
      //   console.log('fullscreenchange2 click ', document.fullscreenElement)
      //   // if (!document.fullscreenElement) {
      //   //   videoShow.requestFullscreen().catch((err) => {
      //   //     console.error('Failed to enter fullscreen mode:', err)
      //   //   })
      //   // } else {
      //   //   document.exitFullscreen()
      //   // }
      // })

      console.log(videoShow)
      console.log(myVideo)

      clearInterval(intervalId)
    } else {
      console.log('no video-show....')
    }
  }, INTERVAL_STEP)
}

// // set Esc event
// document.addEventListener('keydown', function (e) {
//   console.log("document.addEventListener('keydown'", e)
//   if (e.key === 'Escape') {
//     if (isVirtualFullscreen) {
//       isVirtualFullscreen = false
//       console.log('isVirtualFullscreen[Esc]', isVirtualFullscreen)
//       const videoShow = document.getElementById('video-show')
//       document.exitFullscreen()
//       // videoShow.classList.toggle('fullscreen')
//     }
//     // if (document.exitFullscreen) {
//     //   document.exitFullscreen()
//     // }
//   }
// })

// simulate Esc press
// let escEvent = new KeyboardEvent("keydown", {
//   bubbles: true, cancelable: true, keyCode: 27
//    /* 27 is the keycode for ESC */
// });
// document.dispatchEvent(escEvent);

function videoShowFullScreen() {
  const videoContainer = document.getElementById('video-show')

  if (videoContainer.requestFullscreen) {
    videoContainer.requestFullscreen()
    // @ts-ignore
  } else if (videoContainer.mozRequestFullScreen) {
    /* Firefox */
    // @ts-ignore
    videoContainer.mozRequestFullScreen()
    // @ts-ignore
  } else if (videoContainer.webkitRequestFullscreen) {
    /* Chrome, Safari and Opera */
    // @ts-ignore
    videoContainer.webkitRequestFullscreen()
    // @ts-ignore
  } else if (videoContainer.msRequestFullscreen) {
    /* IE/Edge */
    // @ts-ignore
    videoContainer.msRequestFullscreen()
  }
}

function triggeeClick() {
  const myVideo = document.getElementById('my-video')

  // Create a new mouse click event
  var clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  })

  myVideo.dispatchEvent(clickEvent)
}

// function videoClick() {
//   const videoElement = document.getElementById('my-video')

//   // Create a new mouse click event
//   var clickEvent = new MouseEvent('click', {
//     bubbles: true,
//     cancelable: true,
//     view: window,
//   })

//   // Dispatch the click event on the video element
//   videoElement.dispatchEvent(clickEvent)
// }

function buttonClick() {
  var myButton = document.getElementById('full-screen')
  myButton.click()
}
