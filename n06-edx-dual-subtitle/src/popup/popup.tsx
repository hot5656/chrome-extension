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
          if (tabs[0].url.match('https://learning.edx.org/course/*')) {
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
                      ['language2ndEdx', 'dualTitleEdx'],
                      (res) => {
                        // console.log('sync.get(popupo):', res)

                        if (res.language2ndEdx) {
                          setlanguageType2(res.language2ndEdx)
                        }
                        // console.log(
                        //   'setlanguageType2:',
                        //   res.language2ndEdx
                        // )

                        setDualMode(res.dualTitleEdx ? DUAL_ON : DUAL_OFF)
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
        dualTitleEdx: false,
      })
      // console.log('sync.set dualTitleEdx :', false)
    } else {
      chrome.storage.sync.set({
        dualTitleEdx: true,
      })
      // console.log('sync.set dualTitleEdx :', true)
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
      language2ndEdx: event.target.value,
    })
    // console.log('sync.set language2ndEdxa :', event.target.value)
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
          <InputLabel id="translate-mode-select-label">Dual Mode</InputLabel>
          <Select
            labelId="translate-mode-select-label"
            id="translate-mode-select"
            value={dualMode}
            label="Dual Mode"
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
