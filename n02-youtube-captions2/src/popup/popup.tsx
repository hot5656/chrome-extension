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
  const [simpleChinese, setSimpleChinese] = useState<boolean>(true)
  const [languageType, setLanguageType] = useState<string>('zh-Hans')

  // when open popup show
  chrome.storage.sync.get(['simpleChinese', 'languageType'], (res) => {
    // if undefine or null return flase
    const isSimpleChinese = res.simpleChinese ?? false
    const languageType = res.languageType ?? 'zh-Hans'
    setSimpleChinese(isSimpleChinese)
    setLanguageType(res.languageType)
    // setSimpleChinese(true)
    // updateShowLanguage(isSimpleChinese)
    console.log('get isSimpleChinese :', simpleChinese)

    // send message from current tab %?%
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const language_mode = simpleChinese ? 'zh-Hans' : 'zh-Hant'

        // console.log('language_mode : ', language_mode)
        // console.log('tabs : ', tabs)

        // Robert(2023/10/06) : popup send message to content script for change language
        if (tabs.length > 0) {
          // console.log('tabs =>', tabs)
          // send when url = https://* %?%
          // 若未設定 在 chrome://extensions/ 或 blank tab 會有問題
          // need set tabs at "permissions" %?%
          // 未設定抓不到 url
          if (tabs[0].url.match('https://www.youtube.com/*')) {
            console.log('language_mode match: ', language_mode)
            console.log('languageType match: ', languageType)
            chrome.tabs.sendMessage(tabs[0].id, {
              language_mode: language_mode,
              languageType: languageType,
            })
          }
        }
      }
    )
  })

  useEffect(() => {
    chrome.storage.sync.get(['simpleChinese', 'languageType'], (res) => {
      // if (res.simpleChinese !== simpleChinese) {
      //   chrome.storage.sync.set({
      //     simpleChinese: simpleChinese,
      //   })
      // }
      console.log('storage simpleChinese:', res.simpleChinese)
      console.log('storage simpleChinese:', res.simpleChinese)
    })
    console.log('useEffect  SimpleChinese :', simpleChinese)
    console.log('useEffect  languageType :', languageType)

    // send message from current tab %?%
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const language_mode = simpleChinese ? 'zh-Hans' : 'zh-Hant'

        // console.log('language_mode : ', language_mode)
        // console.log('tabs : ', tabs)

        // Robert(2023/10/06) : popup send message to content script for change language
        if (tabs.length > 0) {
          // console.log('tabs =>', tabs)
          // send when url = https://* %?%
          // 若未設定 在 chrome://extensions/ 或 blank tab 會有問題
          // need set tabs at "permissions" %?%
          // 未設定抓不到 url
          if (tabs[0].url.match('https://www.youtube.com/*')) {
            console.log('language_mode match: ', language_mode)
            chrome.tabs.sendMessage(tabs[0].id, {
              language_mode: language_mode,
              languageType: languageType,
            })
          }
        }
      }
    )
  }, [])

  // console.log('simpleChinese:', simpleChinese)

  const handleChangeLanguageClick = () => {
    console.log('toggle simpleChinese :', !simpleChinese)
    chrome.storage.sync.set({
      simpleChinese: !simpleChinese,
    })
    setSimpleChinese(!simpleChinese)

    // chrome.storage.sync.set({
    //   simpleChinese: simpleChinese,
    // })
  }

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
      <Button variant="contained" onClick={handleChangeLanguageClick}>
        切換語言
      </Button>

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

  // return (
  //   <div>
  //     <h1>Youtube Double Title</h1>
  //     <h2 id="language">{simpleChinese ? '簡體中文' : '繁體中文'}</h2>
  //     <button id="language_toggle">切換語言</button>
  //   </div>
  // )
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

// const toggleBtn = document.getElementById('language_toggle')
// toggleBtn.addEventListener('click', () => {
//   chrome.storage.sync.get(['simpleChinese'], (res) => {
//     console.log('get simpleChinese:', res.simpleChinese)

//     chrome.storage.sync.set({
//       simpleChinese: !res.simpleChinese,
//     })

//     console.log('set simpleChinese:', !res.simpleChinese)
//     updateShowLanguage(!res.simpleChinese)
//   })
// })

// function updateShowLanguage(isSimpleChinese) {
//   const languageElement = document.getElementById('language')

//   console.log('show simpleChinese:', isSimpleChinese)
//   if (isSimpleChinese) {
//     languageElement.textContent = '簡體中文'
//   } else {
//     languageElement.textContent = '繁體中文'
//   }
// }

// // when open popup show
// chrome.storage.sync.get(['simpleChinese'], (res) => {
//   // if undefine or null return flase
//   const isSimpleChinese = res.simpleChinese ?? false
//   updateShowLanguage(isSimpleChinese)
// })
