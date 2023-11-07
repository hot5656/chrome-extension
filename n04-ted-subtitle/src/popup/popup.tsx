import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Button, TextField, Typography } from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [offsetMsInput, setOffsetMsInput] = useState<string>('0')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState<File | null>(null)
  const [talkId, setTalkId] = useState<string>('')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [subtitle, setSubtitle] = useState<string>('')

  console.log('------> 1.')
  getTalkId()
  console.log('------> 2.')

  function getTalkId() {
    console.log('------> 3.')
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        console.log('------> 4.')
        console.log(tabs)
        if (tabs.length > 0) {
          console.log(tabs[0].url)
          if (tabs[0].url.match('https://www.ted.com/talks*')) {
            console.log('------> 5.')
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                message: 'get talkId',
              },
              (response) => {
                console.log(response.talkId)
                setTalkId(response.talkId)
                setVideoUrl(response.videoUrl)
                setSubtitle(response.subtitle)
              }
            )
          }
        }
      }
    )
  }

  const handleGenerateSubtitle = () => {
    console.log('handleGenerateSubtitle', offsetMsInput)

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          if (tabs[0].url.match('https://www.ted.com/talks*')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              message: 'generate subtitle',
              offsetMs: parseInt(offsetMsInput, 10),
            })

            setButtonDisabled(true)
            setTimeout(() => {
              setButtonDisabled(false)
            }, 5000)

            console.log('send message...')
          }
        }
      }
    )
  }

  const handleSubtitleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      // setSelectedSubtitle(files[0])
      console.log('local subtitle:', files[0].name)
      const subtitleUrl = URL.createObjectURL(files[0])
      console.log('subtitleUrl:', subtitleUrl)
      sendLocalSubtitle(subtitleUrl)
    }
  }

  const back5s = () => {
    seekBySeconds(-5)
  }

  const forth5s = () => {
    seekBySeconds(5)
  }

  const handleLoadVideo = () => {
    const changeVideoAndSubtitleButton = document.getElementById(
      'changeVideoAndSubtitleButton'
    )
    // changeVideoAndSubtitleButton.addEventListener('click', () => {
    const videoPlayer = document.getElementById(
      'videoPlayer'
    ) as HTMLSourceElement
    // const newVideoSrc = 'URL_TO_NEW_VIDEO.mp4' // Replace with the URL of the new video
    const subtitleTrack = document.getElementById(
      'subtitleTrack'
    ) as HTMLTrackElement

    // Change the video source
    if (videoUrl !== '') {
      const sourceElement = document.querySelector(
        'source[type="video/mp4"]'
      ) as HTMLSourceElement
      sourceElement.src = videoUrl
      // videoPlayer.src = videoUrl
    }

    console.log('===========================')
    console.log('subtitle:', subtitle)
    console.log('===========================')
  }

  // Load the selected subtitle when the component mounts
  React.useEffect(() => {
    if (selectedSubtitle) {
      const videoPlayer = document.getElementById(
        'videoPlayer'
      ) as HTMLVideoElement
      const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track
      const subtitleUrl = URL.createObjectURL(selectedSubtitle)
      const trackElement = document.querySelector(
        'track[kind="subtitles"]'
      ) as HTMLTrackElement

      if (trackElement) {
        trackElement.src = subtitleUrl
      }
    }
  }, [selectedSubtitle])

  return (
    <Box>
      <Typography variant="h5">talkdI : {talkId}</Typography>
      <Typography variant="h5">videoUrl : {videoUrl}</Typography>
      <Typography variant="h5">subtitle : {subtitle}</Typography>
      <Box mx="8px" my="16px">
        <TextField
          id="outlined-number"
          label="offset ms"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          defaultValue={0}
          onChange={(event) => setOffsetMsInput(event.target.value)}
          style={{ width: '190px' }}
        />
      </Box>
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleGenerateSubtitle}
          style={{ width: '190px' }}
          disabled={isButtonDisabled}
        >
          Generate Subtitle
        </Button>
      </Box>

      {/* Video Player */}
      {/* <video id="videoPlayer" controls>
        <source
          src="https://py.tedcdn.com/consus/projects/00/66/56/001/products/downloads/2023v-the-way-we-work-season-06-sharmi-surianarain-001-0348221e-598a-4c8f-aaa0-d76bd17676d2-download-5000k.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video> */}

      <Box mx="8px" my="16px">
        <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
      </Box>
      <Box mx="8px" my="16px">
        <Button
          id="backwardButton"
          variant="contained"
          onClick={back5s}
          style={{ width: '80px' }}
          disabled={isButtonDisabled}
        >
          L5s
        </Button>
        <Button
          id="forwardButton"
          variant="contained"
          onClick={forth5s}
          style={{ width: '80px' }}
          disabled={isButtonDisabled}
        >
          R5s
        </Button>
      </Box>
      <Box mx="8px" my="16px">
        <input
          type="text"
          id="videoUrlInput"
          placeholder="Enter the MP4 video URL"
        />
      </Box>
      <Box mx="8px" my="16px">
        <Button id="loadVideoButton" onClick={handleLoadVideo}>
          Load Video
        </Button>
      </Box>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)

// Function to seek by a specified number of seconds
function seekBySeconds(seconds) {
  const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement
  const backwardButton = document.getElementById('backwardButton')
  const forwardButton = document.getElementById('forwardButton')

  if (!isNaN(videoPlayer.duration)) {
    // Ensure the video duration is known
    videoPlayer.currentTime += seconds

    // Check for valid time range to prevent seeking before the start or after the end
    videoPlayer.currentTime = Math.max(
      0,
      Math.min(videoPlayer.currentTime, videoPlayer.duration)
    )
  }
}

function setVideoSubtitle(subtitle) {
  const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement
  // const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track
  const trackElement = document.querySelector(
    'track[kind="subtitles"]'
  ) as HTMLTrackElement

  if (trackElement) {
    trackElement.src = subtitle
  }
}

function setVideoMp4(url) {
  const videoPlayer = document.getElementById('videoPlayer') as HTMLVideoElement
  // const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track
  const sourceElement = document.querySelector(
    'source[type="video/mp4"]'
  ) as HTMLSourceElement

  if (sourceElement) {
    sourceElement.src = url
  }
}

fetch('https://hls.ted.com/project_masters/8695/subtitles/en/full.vtt', {
  mode: 'cors',
})
  .then((response) => response.text())
  .then((text) => {
    const track = document.createElement('track')
    track.kind = 'subtitles'
    track.srclang = 'en'
    track.label = 'English'
    track.id = 'subtitleTrack'

    const blob = new Blob([text], { type: 'text/vtt' })
    const url = URL.createObjectURL(blob)
    track.src = url

    const video = document.querySelector('video')
    video.appendChild(track)
  })

function sendLocalSubtitle(url) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (tabs.length > 0) {
        if (tabs[0].url.match('https://www.ted.com/talks*')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            message: 'local subtitle',
            url: url,
          })

          console.log('send local subtitle : ', url)
        }
      }
    }
  )
}
