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
  const [languageType, setLanguageType] = useState<string>('zh-Hans')

  // when open popup show
  chrome.storage.sync.get(['languageType'], (res) => {
    const languageType = res.languageType ?? 'zh-Hans'
    setLanguageType(res.languageType)

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
          if (tabs[0].url.match('https://www.youtube.com/*')) {
            console.log('languageType match: ', languageType)
            chrome.tabs.sendMessage(tabs[0].id, {
              languageType: languageType,
            })
          }
        }
      }
    )
  })

  useEffect(() => {
    chrome.storage.sync.get(['languageType'], (res) => {
      console.log('storage languageType:', res.languageType)
    })

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
          if (tabs[0].url.match('https://www.youtube.com/*')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              languageType: languageType,
            })
          }
        }
      }
    )
  }, [])

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageType: event.target.value,
    })
    setLanguageType(event.target.value)
    console.log('languageType :', event.target.value)
  }

  return (
    <Box>
      <Typography variant="h4">Youtube Double Title</Typography>
      <Typography variant="h5">{showLanguage(languageType)}</Typography>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={languageType}
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
  } else if (type === 'zh-Hans') {
    languageName = 'ja'
  } else if (type === 'zh-ko') {
    languageName = 'Korean'
  }

  return languageName
}
