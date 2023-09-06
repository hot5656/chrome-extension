import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Card } from '@mui/material'
import WeatherCard from '../components/WeatherCard'
import { getStoredOptions, LocalStorageOptions } from '../utils/storage'
import { Messages } from '../utils/messages'
import './contentScript.css'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    getStoredOptions().then((options) => {
      setOptions(options)
      setIsActive(options.hasAutoOverlay)
    })
  }, [])

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      console.log('msg:', msg)
      if (msg == Messages.TOGGLE_OVERLAY) {
        setIsActive(!isActive)
      }
    })
  }, [isActive])

  if (!options) {
    return null
  }

  return (
    <>
      {isActive && (
        <Card className="overlayCard">
          <WeatherCard
            city={options.homeCity}
            tempScale={options.tempScale}
            onDelete={() => {
              setIsActive(false)
            }}
          />
        </Card>
      )}
    </>
  )
  // return (
  //   <Card className="overlayCard">
  //     <WeatherCard city="Toronto" tempScale="metric" />
  //   </Card>
  // )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

// root.render(<div>Hello World!</div>)
root.render(<App />)
