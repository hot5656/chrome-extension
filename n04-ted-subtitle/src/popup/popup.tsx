import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Button, TextField } from '@mui/material'
import './popup.css'

// 1st video is ok
const App: React.FC<{}> = () => {
  const [offsetMsInput, setOffsetMsInput] = useState<string>('0')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)

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

  return (
    <Box>
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
    </Box>
  )
}

// subtitle is ok
const App2: React.FC<{}> = () => {
  const [offsetMsInput, setOffsetMsInput] = useState<string>('0')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)

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

  const toggleSubtitles = () => {
    const videoPlayer = document.getElementById(
      'videoPlayer'
    ) as HTMLVideoElement
    const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track

    if (subtitleTrack.mode === 'showing') {
      subtitleTrack.mode = 'hidden' // Hide subtitles
    } else {
      subtitleTrack.mode = 'showing' // Show subtitles
    }
  }

  return (
    <Box>
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
      <video id="videoPlayer" controls>
        <source
          src="2023v-the-way-we-work-season-06-sharmi-surianarain-001-0348221e-598a-4c8f-aaa0-5000k.mp4"
          type="video/mp4"
        />
        <track
          src="sharmi_surianarain_caregiving_is_real_work_let_s_treat_it_that_way_117219_0.vtt"
          kind="subtitles"
          label="English"
          default
        />
        Your browser does not support the video tag.
      </video>
    </Box>
  )
}

const Appx: React.FC<{}> = () => {
  const [offsetMsInput, setOffsetMsInput] = useState<string>('0')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState<File | null>(null)

  const handleGenerateSubtitle = () => {
    // Your existing code for generating subtitles
  }

  const toggleSubtitles = () => {
    const videoPlayer = document.getElementById(
      'videoPlayer'
    ) as HTMLVideoElement
    const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track

    if (subtitleTrack.mode === 'showing') {
      subtitleTrack.mode = 'hidden' // Hide subtitles
    } else {
      subtitleTrack.mode = 'showing' // Show subtitles
    }
    // // Check if a subtitle file has been selected
    // if (selectedSubtitle) {
    //   const subtitleUrl = URL.createObjectURL(selectedSubtitle)
    //   subtitleTrack.src = subtitleUrl
    // }
  }

  const handleSubtitleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedSubtitle(files[0])
    }
  }

  return (
    <Box>
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
      <video id="videoPlayer" controls>
        <source
          src="2023v-the-way-we-work-season-06-sharmi-surianarain-001-0348221e-598a-4c8f-aaa0-5000k.mp4"
          type="video/mp4"
        />
        <track
          src="sharmi_surianarain_caregiving_is_real_work_let_s_treat_it_that_way_117219_0.vtt"
          kind="subtitles"
          label="English"
          default
        />
        Your browser does not support the video tag.
      </video>

      <Box mx="8px" my="16px">
        <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
      </Box>

      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={toggleSubtitles}
          style={{ width: '190px' }}
          disabled={isButtonDisabled}
        >
          Toggle Subtitles
        </Button>
      </Box>
    </Box>
  )
}

const App3: React.FC<{}> = () => {
  const [offsetMsInput, setOffsetMsInput] = useState<string>('0')
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [selectedSubtitle, setSelectedSubtitle] = useState<File | null>(null)

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

  // const toggleSubtitles = () => {
  //   const videoPlayer = document.getElementById(
  //     'videoPlayer'
  //   ) as HTMLVideoElement
  //   const subtitleTrack = videoPlayer.textTracks[0] // Assumes the subtitle track is the first track

  //   if (subtitleTrack.mode === 'showing') {
  //     subtitleTrack.mode = 'hidden' // Hide subtitles
  //   } else {
  //     subtitleTrack.mode = 'showing' // Show subtitles
  //   }
  // }

  const handleSubtitleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedSubtitle(files[0])
    }
  }

  const back5s = () => {
    seekBySeconds(-5)
  }

  const forth5s = () => {
    seekBySeconds(5)
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
      <video id="videoPlayer" controls>
        {/* <source
          src="2023v-the-way-we-work-season-06-sharmi-surianarain-001-0348221e-598a-4c8f-aaa0-5000k.mp4"
          type="video/mp4"
        /> */}
        <source
          src="https://py.tedcdn.com/consus/projects/00/66/56/001/products/downloads/2023v-the-way-we-work-season-06-sharmi-surianarain-001-0348221e-598a-4c8f-aaa0-d76bd17676d2-download-5000k.mp4"
          type="video/mp4"
        />
        <track
          src="sharmi_surianarain_caregiving_is_real_work_let_s_treat_it_that_way_117219_0.vtt"
          kind="subtitles"
          label="English"
          default
        />
        Your browser does not support the video tag.
      </video>

      <Box mx="8px" my="16px">
        <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
      </Box>
      {/* 
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={toggleSubtitles}
          style={{ width: '190px' }}
          disabled={isButtonDisabled}
        >
          Toggle Subtitles
        </Button>
      </Box> */}
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
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App3 />)

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
