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

const TRANSLATE_OFF = 'Off'

const App: React.FC<{}> = () => {
  const [languageTypeYoutube, setlanguageTypeYoutube] =
    useState<string>('zh-Hans')
  const [translateMode, setTranslateMode] = useState<string>('Youtube')

  // when open popup show
  chrome.storage.sync.get(
    ['languageTypeYoutube', 'translateMode', 'doubleTitleYoutube'],
    (res) => {
      const languageTypeYoutube = res.languageTypeYoutube ?? 'zh-Hans'
      setlanguageTypeYoutube(res.languageTypeYoutube)

      if (res.doubleTitleYoutube) {
        setTranslateMode(res.translateMode)
      } else {
        setTranslateMode(TRANSLATE_OFF)
      }

      // send to background.js
      const newIconPath = `${res.doubleTitleYoutube ? 'icon' : 'icon_off'}.png` // Specify the path to the new icon
      chrome.runtime.sendMessage({ changeIcon: true, newIconPath: newIconPath })

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
            // Robert(2023/10/30) : change to just care https://www.youtube.com/watch
            if (tabs[0].url.match('https://www.youtube.com/watch*')) {
              // console.log('languageTypeYoutube match: ', languageTypeYoutube)
              chrome.tabs.sendMessage(tabs[0].id, {
                languageTypeYoutube: languageTypeYoutube,
              })
            }
          }
        }
      )
    }
  )

  // useEffect(() => {
  //   chrome.storage.sync.get(['languageTypeYoutube'], (res) => {
  //     console.log('storage languageTypeYoutube:', res.languageTypeYoutube)
  //   })
  // }, [])

  const handleSelectTranslateModeClick = (event: SelectChangeEvent) => {
    if (event.target.value === TRANSLATE_OFF) {
      chrome.storage.sync.set({
        doubleTitleYoutube: false,
      })
    } else {
      chrome.storage.sync.set({
        doubleTitleYoutube: true,
        translateMode: event.target.value,
      })
    }
    setTranslateMode(event.target.value)
    // console.log('translateMode :', event.target.value)
  }

  const handleSelectLanguageClick = (event: SelectChangeEvent) => {
    chrome.storage.sync.set({
      languageTypeYoutube: event.target.value,
    })
    setlanguageTypeYoutube(event.target.value)
    // console.log('languageTypeYoutube :', event.target.value)
  }

  return (
    <Box>
      {/* <Typography variant="h4">Youtube Double Title</Typography>
      <Typography variant="h5">{translateMode}</Typography>
      <Typography variant="h5">{showLanguage(languageTypeYoutube)}</Typography> */}
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="translate-mode-select-label">
            Translate Mode
          </InputLabel>
          <Select
            labelId="translate-mode-select-label"
            id="translate-mode-select"
            value={translateMode}
            label="Translate Mode"
            onChange={handleSelectTranslateModeClick}
          >
            <MenuItem value={TRANSLATE_OFF}>{TRANSLATE_OFF}</MenuItem>
            <MenuItem value={'Youtube'}>Youtube</MenuItem>
            <MenuItem value={'OnLine'}>OnLine</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box my={'16px'}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={languageTypeYoutube}
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
