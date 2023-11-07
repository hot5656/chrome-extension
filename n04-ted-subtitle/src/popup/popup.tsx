import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Button, TextField } from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)

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
          if (tabs[0].url.match('https://www.ted.com/talks*')) {
            chrome.tabs.sendMessage(tabs[0].id, {
              message: 'generate subtitle',
            })

            setButtonDisabled(true)
            setTimeout(() => {
              setButtonDisabled(false)
            }, 5000)

            console.log('send message...')
          }
        }
      }
    )
  }

  return (
    <Box>
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
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
