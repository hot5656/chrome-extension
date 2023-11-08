import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Button, TextField, Typography } from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)
  const [responseMessage, setResponseMessage] = useState<string>('')

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
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                message: 'generate subtitle',
              },
              (response) => {
                if (response) {
                  console.log('response:', response)
                } else {
                  console.log('no response....')
                }

                if (response.talkId === '') {
                  setResponseMessage('Wait sometime then try ... ')
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
      <Typography variant="body1">{responseMessage}</Typography>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
