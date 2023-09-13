import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Grid, InputBase, Paper, IconButton } from '@mui/material'
import {
  Add as AddIcon,
  PictureInPicture as PictureInPictureIcon,
} from '@mui/icons-material'
import '@fontsource/roboto'
import './popup.css'
import WeatherCard from '../components/WeatherCard'
import {
  getStoredCities,
  setStoredCities,
  getStoredOptions,
  setStoredOptions,
  LocalStorageOptions,
} from '../utils/storage'
import { Messages } from '../utils/messages'

const App: React.FC<{}> = () => {
  const [cities, setCities] = useState<string[]>([])
  const [cityInput, setCityInput] = useState<string>('')
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)

  useEffect(() => {
    getStoredCities().then((cities) => setCities(cities))
    getStoredOptions().then((options) => setOptions(options))
  }, [])

  // add city
  const handleCityButtonClick = () => {
    if (cityInput == '') {
      return
    }
    const updateCities = [...cities, cityInput]
    setStoredCities(updateCities).then(() => {
      setCities(updateCities)
      setCityInput('')
    })
  }

  // delete city
  const handleCityDeleteButtonClick = (index: number) => {
    cities.splice(index, 1)
    const updateCites = [...cities]
    setStoredCities(updateCites).then(() => {
      setCities(updateCites)
    })
  }

  // toggle show temperature type
  const handleTempScaleButtonClick = () => {
    const updateOptions: LocalStorageOptions = {
      ...options,
      tempScale: options.tempScale === 'metric' ? 'imperial' : 'metric',
    }
    setStoredOptions(updateOptions).then(() => {
      setOptions(updateOptions)
    })
  }

  // Overlay control
  const handleOverlayButtonClick = () => {
    // send message from current tab %?%
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs.length > 0) {
          // console.log('tabs =>', tabs)
          // send when url = https://* %?%
          // 若未設定 在 chrome://extensions/ 或 blank tab 會有問題
          // need set tabs at "permissions" %?%
          // 未設定抓不到 url
          if (tabs[0].url.match('https://*')) {
            chrome.tabs.sendMessage(tabs[0].id, Messages.TOGGLE_OVERLAY)
          }
        }
      }
    )
  }

  if (!options) {
    return null
  }

  return (
    <Box mx="8px" my="16px">
      <Grid container justifyContent="space-evenly">
        <Grid item>
          <Paper>
            <Box px="15px" py="5px">
              <InputBase
                placeholder="Add a city name"
                value={cityInput}
                onChange={(event) => setCityInput(event.target.value)}
              />
              <IconButton onClick={handleCityButtonClick}>
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <Box py="4px">
              <IconButton onClick={handleTempScaleButtonClick}>
                {/* %?% options != null show 後面內容 */}
                {options != null &&
                  (options.tempScale === 'metric' ? '\u2103' : '\u2109')}
              </IconButton>
            </Box>
          </Paper>
        </Grid>
        <Grid item>
          <Paper>
            <Box py="4px">
              <IconButton onClick={handleOverlayButtonClick}>
                <PictureInPictureIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {options != null && options.homeCity != '' && (
        <WeatherCard city={options.homeCity} tempScale={options.tempScale} />
      )}
      {cities.map((city, index) => (
        <WeatherCard
          city={city}
          tempScale={options.tempScale}
          key={index}
          onDelete={() => {
            handleCityDeleteButtonClick(index)
          }}
        />
      ))}
      <Box height="16px"> </Box>
    </Box>
  )
}

const rootElement = document.createElement('div')
document.body.appendChild(rootElement)
const root = ReactDOM.createRoot(rootElement)

root.render(<App />)
