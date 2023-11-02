import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Button, TextField } from '@mui/material'
import './popup.css'

const App: React.FC<{}> = () => {
  const [isButtonDisabled, setButtonDisabled] = useState<boolean>(false)

  const handleGenerateSubtitle = () => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          if (
            tabs[0].url.match('https://www.udemy.com/home/my-courses/learning*')
          ) {
            chrome.tabs.sendMessage(tabs[0].id, {
              message: 'my courses',
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
          Load My courses
        </Button>
      </Box>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
