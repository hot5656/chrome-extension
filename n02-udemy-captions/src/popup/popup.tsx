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

const App: React.FC<{}> = () => {
  const [languageTypeUdemy, setlanguageTypeUdemy] = useState<string>('zh-Hant')

  // when open popup show
  chrome.storage.sync.get(['languageTypeUdemy'], (res) => {
    const languageTypeUdemy = res.languageTypeUdemy ?? 'zh-Hant'
    setlanguageTypeUdemy(res.languageTypeUdemy)

    // send message from current tab %?%
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        // Robert(2023/10/06) : popup send message to content script for change language
        if (tabs.length > 0) {
          // console.log('tabs =>', tabs)
          // send when url = https://* %?%
          // 若未設定 在 chrome://extensions/ 或 blank tab 會有問題
          // need set tabs at "permissions" %?%
          // 未設定抓不到 url
          if (tabs[0].url.match('https://www.udemy.com/*')) {
            console.log('languageTypeUdemy match: ', languageTypeUdemy)
            chrome.tabs.sendMessage(tabs[0].id, {
              languageTypeUdemy: languageTypeUdemy,
            })
          }
        }
      }
    )
  })

  // useEffect(() => {
  //   chrome.storage.sync.get(['languageTypeUdemy'], (res) => {
  //     console.log('storage languageTypeUdemy:', res.languageTypeUdemy)
  //   })
  // }, [])

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageTypeUdemy: event.target.value,
    })
    setlanguageTypeUdemy(event.target.value)
    console.log('languageTypeUdemy :', event.target.value)
  }

  return (
    <Box>
      <Typography variant="h4">Udemy Double Title</Typography>
      <Typography variant="h5">{showLanguage(languageTypeUdemy)}</Typography>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={languageTypeUdemy}
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
  } else if (type === 'zh-ko') {
    languageName = 'Korean'
  }

  return languageName
}
