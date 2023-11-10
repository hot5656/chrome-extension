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

  chrome.storage.sync.get(['languageTypeTed'], (res) => {
    const languageType = res.languageTypeTed ?? 'zh-Hant'
    setlanguageTypeTed(languageType)
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

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageTypeTed: event.target.value,
    })
    setlanguageTypeTed(event.target.value)
    console.log('languageTypeTed :', event.target.value)
  }

  return (
    <Box>
      <Typography variant="h5">{showLanguage(languageTypeTed)}</Typography>
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
          Generate Subtitle
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
  }

  return languageName
}
