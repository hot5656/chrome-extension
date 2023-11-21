import React, { useEffect, useState } from 'react'
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
import { LANGUGAES_INFO, UDAL_MODE } from '../utils/messageType'
import './popup.css'

const DUAL_OFF = 'Off'
const DUAL_ON = 'On'

const App: React.FC<{}> = () => {
  const [languageType2, setlanguageType2] = useState<string>('')
  const [responseMessage, setResponseMessage] = useState<string>('')
  const [dualMode, setDualMode] = useState<string>(DUAL_OFF)
  const [isDownloadButtonDisabled, setIsDownloadButtonDisabled] =
    useState<boolean>(false)
  const [isActiveButtonDisabled, setIsActiveButtonDisabled] =
    useState<boolean>(false)
  const [languageOptions, setLanguageOptions] = useState([])

  useEffect(() => {
    sendMessageToContentScript(LANGUGAES_INFO, { message: LANGUGAES_INFO })
  }, [])

  function sendMessageToContentScript(messageType, messages) {
    // console.log('sendMessageToContentScript:', messages)
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        // console.log(tabs)
        if (tabs.length > 0) {
          // console.log(tabs[0].url)
          if (
            tabs[0].url.includes('lecture') &&
            tabs[0].url.match('https://www.coursera.org/learn/*')
          ) {
            chrome.tabs.sendMessage(tabs[0].id, messages, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
              }

              // console.log('response:', response)
              if (response) {
                setResponseMessage(response.message)
                if (messageType === LANGUGAES_INFO) {
                  setLanguageOptions(response.languages)
                  if (response.languages.length > 0) {
                    chrome.storage.sync.get(
                      ['language2ndCoursera', 'dualTitleCoursera'],
                      (res) => {
                        if (res.language2ndCoursera) {
                          setlanguageType2(res.language2ndCoursera)
                        }
                        // console.log(
                        //   'setlanguageType2:',
                        //   res.language2ndCoursera
                        // )

                        setDualMode(res.dualTitleCoursera ? DUAL_ON : DUAL_OFF)
                        // console.log('chrome.storage.sync.get...')
                      }
                    )
                  }
                }
              } else {
                setResponseMessage('no response message....')
              }
            })

            // console.log('send message...')
          } else {
            setResponseMessage('Not the Correct Website ...')
          }
        }
      }
    )
  }

  const handDualModeClick = (event: SelectChangeEvent) => {
    if (event.target.value === DUAL_OFF) {
      chrome.storage.sync.set({
        dualTitleCoursera: false,
      })
    } else {
      chrome.storage.sync.set({
        dualTitleCoursera: true,
      })
    }
    setDualMode(event.target.value)
    // console.log(`set ${event.target.value}`)

    sendMessageToContentScript(UDAL_MODE, {
      message: UDAL_MODE,
      duleMode: event.target.value === DUAL_ON,
      secondLanguage: languageType2,
    })
  }

  const handle2ndLanguageClick = (event: SelectChangeEvent) => {
    setlanguageType2(event.target.value)
    chrome.storage.sync.set({
      language2ndCoursera: event.target.value,
    })
    sendMessageToContentScript(UDAL_MODE, {
      message: UDAL_MODE,
      duleMode: dualMode === DUAL_ON,
      secondLanguage: event.target.value,
    })
  }

  return (
    <Box>
      {/* <Typography variant="h5">{dualMode}</Typography>
      <Typography variant="h5">{languageType2}</Typography> */}
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="translate-mode-select-label">
            Translate Mode
          </InputLabel>
          <Select
            labelId="translate-mode-select-label"
            id="translate-mode-select"
            value={dualMode}
            label="Translate Mode"
            onChange={handDualModeClick}
          >
            <MenuItem value={DUAL_ON}>{DUAL_ON}</MenuItem>
            <MenuItem value={DUAL_OFF}>{DUAL_OFF}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label2">Second Language</InputLabel>
          <Select
            labelId="language-select-label2"
            id="language-select"
            value={languageType2}
            label="Second Language"
            onChange={handle2ndLanguageClick}
          >
            {languageOptions.map((option, index) => (
              <MenuItem key={index} value={option.label}>
                {option.label}
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
