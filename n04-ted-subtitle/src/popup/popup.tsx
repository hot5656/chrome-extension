import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [responseMessage, setResponseMessage] = useState<string>('')
  const [languageTypeTed, setlanguageTypeTed] = useState<string>('zh-Hant')
  const [fontSizeTed, setFontSizeTed] = useState<string>('video-16')

  chrome.storage.sync.get(['languageTypeTed', 'fontSizeTed'], (res) => {
    const languageType = res.languageTypeTed ?? 'zh-Hant'
    const fontSize = res.fontSizeTed ?? 'video-16'
    setlanguageTypeTed(languageType)
    setFontSizeTed(fontSize)
  })

  const handleGenerateSubtitle = () => {
    console.log('handleGenerateSubtitle')

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
            tabs[0].url !== 'https://www.ted.com/talks' &&
            tabs[0].url.match('https://www.ted.com/talks/*')
          ) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                message: 'generate subtitle',
                languageType: languageTypeTed,
              },
              (response) => {
                if (response) {
                  console.log('response:', response)
                } else {
                  console.log('no response....')
                }

                if (response.talkId === '') {
                  setResponseMessage('Wait Sometime then try ...')
                } else if (response.vttUrl === '') {
                  setResponseMessage('No Subtitle Support ...')
                } else {
                  setResponseMessage('')

                  setButtonDisabled(true)
                  setTimeout(() => {
                    setButtonDisabled(false)
                  }, 5000)
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

  const handleDownloadEnglishSubtitle = () => {
    console.log('handleDownloadEnglishSubtitle')

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
            tabs[0].url !== 'https://www.ted.com/talks' &&
            tabs[0].url.match('https://www.ted.com/talks/*')
          ) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                message: 'download english subtitle',
              },
              (response) => {
                if (response) {
                  console.log('response:', response)
                } else {
                  console.log('no response....')
                }

                if (response.talkId === '') {
                  setResponseMessage('Wait Sometime then try ...')
                } else if (response.vttUrl === '') {
                  setResponseMessage('No Subtitle Support ...')
                } else {
                  setResponseMessage('')
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

  const handleSelectFontsizeClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      fontSizeTed: event.target.value,
    })
    setFontSizeTed(event.target.value)
    console.log('Fontsize :', event.target.value)

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          if (
            tabs[0].url !== 'https://www.ted.com/talks' &&
            tabs[0].url.match('https://www.ted.com/talks/*')
          ) {
            chrome.tabs.sendMessage(tabs[0].id, {
              message: 'update fontsize',
              fontSize: event.target.value,
            })

            console.log('send message(update fontsize)...')
          } else {
            setResponseMessage('Not the Correct Website ...')
          }
        }
      }
    )
  }

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageTypeTed: event.target.value,
    })
    setlanguageTypeTed(event.target.value)
    console.log('languageTypeTed :', event.target.value)
  }

  return (
    <Box>
      {/* <Typography variant="h5">{fontSize(fontSizeTed)}</Typography>
      <Typography variant="h5">{showLanguage(languageTypeTed)}</Typography> */}
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="fontsize-select-label">Font Size</InputLabel>
          <Select
            labelId="fontsize-label"
            id="fontsize-select"
            value={fontSizeTed}
            label="Fontsize"
            onChange={handleSelectFontsizeClick}
          >
            <MenuItem value={'video-16'}>Default</MenuItem>
            <MenuItem value={'video-24'}>24px</MenuItem>
            <MenuItem value={'video-32'}>32px</MenuItem>
            <MenuItem value={'video-40'}>40px</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={languageTypeTed}
            label="Language"
            onChange={handleSelectLanguageClick}
          >
            <MenuItem value={'zh-Hant'}>Chinese Traditional</MenuItem>
            <MenuItem value={'zh-Hans'}>Chinese Simplified</MenuItem>
            <MenuItem value={'ja'}>Japanese</MenuItem>
            <MenuItem value={'ko'}>Korean</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleGenerateSubtitle}
          style={{ width: '190px' }}
          disabled={isButtonDisabled}
        >
          Generate Dual Subtitle
        </Button>
      </Box>
      {/* <Box mx="8px" my="16px">
        <Button
          variant="contained"
          onClick={handleDownloadEnglishSubtitle}
          style={{ width: '190px' }}
        >
          Download English Subtitle
        </Button>
      </Box> */}
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
  }

  return languageName
}

function fontSize(type) {
  let fontSize = 'video-16'
  if (type === 'video-16') {
    fontSize = 'Default'
  } else if (type === 'video-24') {
    fontSize = '24px'
  } else if (type === 'video-32') {
    fontSize = '32px'
  } else if (type === 'video-40') {
    fontSize = '40px'
  }

  return fontSize
}
