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
import './popup.css'

const DUAL_OFF = 'Off'
const DUAL_ON = 'On'

const App: React.FC<{}> = () => {
  const [languageType1, setlanguageType1] = useState<string>('zh-Hant')
  const [languageType2, setlanguageType2] = useState<string>('en')
  const [responseMessage, setResponseMessage] = useState<string>('')

  const [dualMode, setDualMode] = useState<string>(DUAL_OFF)

  // when open popup show
  chrome.storage.sync.get(
    ['language1stCoursera', 'language2ndCoursera', 'dualTitleUCoursera'],
    (res) => {
      if (res.language1stCoursera) {
        setlanguageType1(res.language1stCoursera)
      }
      if (res.language2stCoursera) {
        setlanguageType2(res.language2stCoursera)
      }

      setDualMode(res.dualTitleUCoursera ? DUAL_ON : DUAL_OFF)
    }
  )

  // useEffect(() => {
  //   chrome.storage.sync.get(['languageTypeUdemy'], (res) => {
  //     console.log('storage languageTypeUdemy:', res.languageTypeUdemy)
  //   })
  // }, [])

  // const handleSelectTranslateModeClick = (event: SelectChangeEvent) => {
  //   if (event.target.value === DUAL_OFF) {
  //     chrome.storage.sync.set({
  //       dualTitleUCoursera: false,
  //     })
  //   } else {
  //     chrome.storage.sync.set({
  //       dualTitleUCoursera: true,
  //     })
  //   }
  //   setTranslateMode(event.target.value)
  //   // console.log('translateMode :', event.target.value)
  // }

  // const handleSelectLanguageClick = (event: SelectChangeEvent) => {
  //   chrome.storage.sync.set({
  //     languageTypeUdemy: event.target.value,
  //   })
  //   setlanguageTypeUdemy(event.target.value)
  //   // console.log('languageTypeUdemy :', event.target.value)
  // }

  const handleDownloadChineseSubtitle = () => {
    console.log('handleDownloadChineseSubtitle')

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        console.log(tabs)
        if (tabs.length > 0) {
          console.log(tabs[0].url)
          if (tabs[0].url.match('https://www.coursera.org/learn/*')) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                message: 'download chinese subtitle',
              },
              (response) => {
                console.log('response:', response)
                if (response) {
                  setResponseMessage(response.message)
                } else {
                  setResponseMessage('no response message....')
                }
              }
            )

            console.log('send message...')
          } else {
            setResponseMessage('Not the Correct Website ...')
          }
        }
      }
    )
  }

  return (
    <Box>
      <Typography variant="h5">{dualMode}</Typography>
      <Typography variant="h5">{showLanguage(languageType1)}</Typography>
      <Typography variant="h5">{showLanguage(languageType2)}</Typography>
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
          >
            <MenuItem value={DUAL_ON}>{DUAL_ON}</MenuItem>
            <MenuItem value={DUAL_OFF}>{DUAL_OFF}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label1">Language 1st</InputLabel>
          <Select
            labelId="language-select-label1"
            id="language-select1"
            value={languageType1}
            label="Language1"
          >
            <MenuItem value={'zh-Hant'}>Chinese Traditional</MenuItem>
            <MenuItem value={'zh-Hans'}>Chinese Simplified</MenuItem>
            <MenuItem value={'ja'}>Japanese</MenuItem>
            <MenuItem value={'ko'}>Korean</MenuItem>
            <MenuItem value={'en'}>English</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label2">Language 2nd</InputLabel>
          <Select
            labelId="language-select-label2"
            id="language-select"
            value={languageType2}
            label="Language2"
          >
            <MenuItem value={'zh-Hant'}>Chinese Traditional</MenuItem>
            <MenuItem value={'zh-Hans'}>Chinese Simplified</MenuItem>
            <MenuItem value={'ja'}>Japanese</MenuItem>
            <MenuItem value={'ko'}>Korean</MenuItem>
            <MenuItem value={'en'}>English</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleDownloadChineseSubtitle}
          style={{ width: '190px' }}
        >
          Download Chinese Subtitle
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

function showLanguage(type) {
  let languageName = 'Chinese Simplified'
  if (type === 'zh-Hans') {
    languageName = 'Chinese Simplified'
  } else if (type === 'zh-Hant') {
    languageName = 'Chinese Traditional'
  } else if (type === 'ja') {
    languageName = 'Japanese'
  } else if (type === 'ko') {
    languageName = 'Korean'
  } else if (type === 'en') {
    languageName = 'English'
  }

  return languageName
}
