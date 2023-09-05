import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Card } from '@mui/material'
import WeatherCard from '../components/WeatherCard'
import { getStoredOptions, LocalStorageOptions } from '../utils/storage'
import './contentScript.css'

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  const [isActive, setIsActive] = useState<boolean>(true)

  useEffect(() => {
    getStoredOptions().then((options) => setOptions(options))
  }, [])

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
