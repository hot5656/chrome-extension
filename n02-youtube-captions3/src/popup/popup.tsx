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
  const [languageTypeYoutube2, setlanguageTypeYoutube2] =
    useState<string>('zh-Hant')

  // when open popup show
  chrome.storage.sync.get(['languageTypeYoutube2'], (res) => {
    const languageTypeYoutube2 = res.languageTypeYoutube2 ?? 'zh-Hant'
    setlanguageTypeYoutube2(res.languageTypeYoutube2)

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
            console.log('languageTypeYoutube2 match: ', languageTypeYoutube2)
            chrome.tabs.sendMessage(tabs[0].id, {
              languageTypeYoutube2: languageTypeYoutube2,
            })
          }
        }
      }
    )
  })

  // useEffect(() => {
  //   chrome.storage.sync.get(['languageTypeYoutube2'], (res) => {
  //     console.log('storage languageTypeYoutube2:', res.languageTypeYoutube2)
  //   })
  // }, [])

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageTypeYoutube2: event.target.value,
    })
    setlanguageTypeYoutube2(event.target.value)
    console.log('languageTypeYoutube2 :', event.target.value)
  }

  return (
    <Box>
      <Typography variant="h4">Youtube Double Subtitle #2</Typography>
      <Typography variant="h5">{showLanguage(languageTypeYoutube2)}</Typography>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">Language</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={languageTypeYoutube2}
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
  } else if (type === 'ko') {
    languageName = 'Korean'
  }

  return languageName
}
