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
} from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [simpleChinese, setSimpleChinese] = useState<boolean>(true)

  // when open popup show
  chrome.storage.sync.get(['simpleChinese'], (res) => {
    // if undefine or null return flase
    const isSimpleChinese = res.simpleChinese ?? false
    setSimpleChinese(isSimpleChinese)
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

        if (tabs.length > 0) {
          // console.log('tabs =>', tabs)
          // send when url = https://* %?%
          // 若未設定 在 chrome://extensions/ 或 blank tab 會有問題
          // need set tabs at "permissions" %?%
          // 未設定抓不到 url
          if (tabs[0].url.match('https://*')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              language_mode: language_mode,
            })
          }
        }
      }
    )
  })

  // useEffect(() => {
  //   chrome.storage.sync.get(['simpleChinese'], (res) => {
  //     if (res.simpleChinese !== simpleChinese) {
  //       chrome.storage.sync.set({
  //         simpleChinese: simpleChinese,
  //       })
  //       console.log('update  storage :', simpleChinese)
  //     }
  //   })
  // }, [])

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

  return (
    <Box>
      <Typography variant="h4">Youtube Double Title</Typography>
      <Typography variant="h5">
        {simpleChinese ? '簡體中文' : '繁體中文'}
      </Typography>
      <Button variant="contained" onClick={handleChangeLanguageClick}>
        切換語言
      </Button>
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
