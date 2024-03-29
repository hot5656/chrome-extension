import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import {
  MESSAGE_SUBTITLE_MODE,
  MESSAGE_2ND_LANGUAGE,
  SUBTITLE_MODE,
  SUBTITLE_MODE_DUAL,
  SECOND_LANGUES_TRADITIONAL,
  SECOND_LANGUES,
} from '../utils/messageType'
import './popup.css'

const App: React.FC<{}> = () => {
  const [subtitleMode, setSubtitleMode] = useState<string>(
    SUBTITLE_MODE[SUBTITLE_MODE_DUAL]
  )
  const [secondLanguage, setSecondLanguage] = useState<string>(
    SECOND_LANGUES[SECOND_LANGUES_TRADITIONAL].value
  )
  const [responseMessage, setResponseMessage] = useState<string>('')

  function sendMessageToContentScript(messageType, messages) {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          if (tabs[0].url.match('https://www.udemy.com/*')) {
            chrome.tabs.sendMessage(tabs[0].id, messages, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
              }
            })
          }
        }
      }
    )
  }

  // when open popup show
  chrome.storage.sync.get(['subtitleModeUdemy', 'language2ndUdemy'], (res) => {
    setSubtitleMode(
      res.subtitleModeUdemy
        ? res.subtitleModeUdemy
        : SUBTITLE_MODE[SUBTITLE_MODE_DUAL]
    )
    setSecondLanguage(
      res.language2ndUdemy
        ? res.language2ndUdemy
        : SECOND_LANGUES[SECOND_LANGUES_TRADITIONAL].value
    )
  })

  const handleSubtitleModeClick = (event: SelectChangeEvent) => {
    setSubtitleMode(event.target.value)
    chrome.storage.sync.set({
      subtitleModeUdemy: event.target.value,
    })

    sendMessageToContentScript(MESSAGE_SUBTITLE_MODE, {
      message: MESSAGE_SUBTITLE_MODE,
      subtitleMode: event.target.value,
    })
  }

  const handleSecondLanguageClick = (event: SelectChangeEvent) => {
    setSecondLanguage(event.target.value)
    chrome.storage.sync.set({
      language2ndUdemy: event.target.value,
    })

    sendMessageToContentScript(MESSAGE_2ND_LANGUAGE, {
      message: MESSAGE_2ND_LANGUAGE,
      secondLanguage: event.target.value,
    })
  }

  return (
    <Box>
      {/* <Typography variant="h5">{subtitleMode}</Typography>
      <Typography variant="h5">{secondLanguage}</Typography> */}
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="subtitle-mode-select-label">Subtitle Mode</InputLabel>
          <Select
            labelId="subtitle-mode-select-label"
            id="subtitle-select"
            value={subtitleMode}
            label="Second Language"
            onChange={handleSubtitleModeClick}
          >
            {SUBTITLE_MODE.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">Second Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={secondLanguage}
            label="Second Language"
            onChange={handleSecondLanguageClick}
          >
            {SECOND_LANGUES.map((option, index) => (
              <MenuItem key={index} value={option.value}>
                {option.language}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="body1">{responseMessage}</Typography>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
