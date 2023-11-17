import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import {
  DOWNLOAD_SUBTITLE,
  SHOW_ACTIVE,
  LANGUGAES_INFO,
  UDAL_MODE,
} from '../utils/messageType'
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
    // chrome.storage.sync.get(
    //   ['language2ndCoursera', 'dualTitleUCoursera'],
    //   (res) => {
    //     if (res.language2ndCoursera) {
    //       setlanguageType2(res.language2ndCoursera)
    //     }
    //     console.log('setlanguageType2:', res.language2ndCoursera)

    //     setDualMode(res.dualTitleUCoursera ? DUAL_ON : DUAL_OFF)
    //     console.log('chrome.storage.sync.get...')
    //   }
    // )
    sendMessageToContentScript(LANGUGAES_INFO, { message: LANGUGAES_INFO })
  }, [])

  const handleDownloadChineseSubtitle = () => {
    console.log('handleDownloadChineseSubtitle')
    sendMessageToContentScript(DOWNLOAD_SUBTITLE, {
      message: DOWNLOAD_SUBTITLE,
    })
  }

  const handleShowActive = () => {
    console.log('handleDownloadChineseSubtitle')
    sendMessageToContentScript(SHOW_ACTIVE, { message: SHOW_ACTIVE })
  }

  function sendMessageToContentScript(messageType, messages) {
    console.log('sendMessageToContentScript:', messages)
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        console.log(tabs)
        if (tabs.length > 0) {
          console.log(tabs[0].url)
          if (
            tabs[0].url.includes('lecture') &&
            tabs[0].url.match('https://www.coursera.org/learn/*')
          ) {
            chrome.tabs.sendMessage(tabs[0].id, messages, (response) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError)
              }

              if (messageType === DOWNLOAD_SUBTITLE) {
                console.log('DOWNLOAD_SUBTITLE')
              } else if (messageType === SHOW_ACTIVE) {
                console.log('SHOW_ACTIVE')
              }

              console.log('response:', response)
              if (response) {
                setResponseMessage(response.message)
                if (messageType === DOWNLOAD_SUBTITLE) {
                  setIsDownloadButtonDisabled(true)
                  setTimeout(() => {
                    setIsDownloadButtonDisabled(false)
                  }, 5000)
                } else if (messageType === SHOW_ACTIVE) {
                  setIsActiveButtonDisabled(true)
                  setTimeout(() => {
                    setIsActiveButtonDisabled(false)
                  }, 5000)
                } else if (messageType === LANGUGAES_INFO) {
                  setLanguageOptions(response.languages)
                  if (response.languages.length > 0) {
                    chrome.storage.sync.get(
                      ['language2ndCoursera', 'dualTitleUCoursera'],
                      (res) => {
                        if (res.language2ndCoursera) {
                          setlanguageType2(res.language2ndCoursera)
                        }
                        console.log(
                          'setlanguageType2:',
                          res.language2ndCoursera
                        )

                        setDualMode(res.dualTitleUCoursera ? DUAL_ON : DUAL_OFF)
                        console.log('chrome.storage.sync.get...')
                      }
                    )
                  }
                }
              } else {
                setResponseMessage('no response message....')
              }
            })

            console.log('send message...')
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
        dualTitleUCoursera: false,
      })
    } else {
      chrome.storage.sync.set({
        dualTitleUCoursera: true,
      })
    }
    setDualMode(event.target.value)
    console.log(`set ${event.target.value}`)

    sendMessageToContentScript(UDAL_MODE, {
      message: UDAL_MODE,
      duleMode: dualMode === event.target.value,
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
      <Typography variant="h5">{dualMode}</Typography>
      <Typography variant="h5">{languageType2}</Typography>
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
            label="Language2"
            onChange={handle2ndLanguageClick}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option.label} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
            {/* <MenuItem value={'zh-Hant'}>Chinese Traditional</MenuItem>
            <MenuItem value={'zh-Hans'}>Chinese Simplified</MenuItem>
            <MenuItem value={'ja'}>Japanese</MenuItem>
            <MenuItem value={'ko'}>Korean</MenuItem>
            <MenuItem value={'en'}>English</MenuItem> */}
          </Select>
        </FormControl>
      </Box>
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleDownloadChineseSubtitle}
          style={{ width: '190px' }}
          disabled={isDownloadButtonDisabled}
        >
          Download Chinese Subtitle
        </Button>
      </Box>
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleShowActive}
          style={{ width: '190px' }}
          disabled={isActiveButtonDisabled}
        >
          Show active
        </Button>
      </Box>
      <Typography variant="body1">{responseMessage}</Typography>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)

// function showLanguage(type) {
//   let languageName = 'Chinese Simplified'
//   if (type === 'zh-Hans') {
//     languageName = 'Chinese Simplified'
//   } else if (type === 'zh-Hant') {
//     languageName = 'Chinese Traditional'
//   } else if (type === 'ja') {
//     languageName = 'Japanese'
//   } else if (type === 'ko') {
//     languageName = 'Korean'
//   } else if (type === 'en') {
//     languageName = 'English'
//   }

//   return languageName
// }
