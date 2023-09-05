import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Box, Grid, InputBase, Paper, IconButton } from '@mui/material'
import { Add as AddIcon, Update } from '@mui/icons-material'
import '@fontsource/roboto'
import './popup.css'
// mean import index
import WeatherCard from './WeatherCard'
import {
  setStoredCities,
  getStoredCities,
  setStoredOptions,
  getStoredOptions,
  LocalStorageOptions,
} from '../utils/storage'

const App: React.FC<{}> = () => {
  // const [cities, setCities] = useState<string[]>([
  //   'Toronto',
  //   'New York',
  //   'Error',
  // ])
  const [cities, setCities] = useState<string[]>([])
  const [cityInput, setCityInput] = useState<string>('')
  const [options, setOptions] = useState<LocalStorageOptions | null>(null)
  // console.log(cityInput)

  useEffect(() => {
    getStoredCities().then((cities) => setCities(cities))
    getStoredOptions().then((options) => setOptions(options))
  }, [])

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

  const handleCityDeleteButtonClick = (index: number) => {
    cities.splice(index, 1)
    const updateCites = [...cities]
    setStoredCities(updateCites).then(() => {
      setCities(updateCites)
    })
  }

  const handleTempScaleButtonClick = () => {
    const updateOptions: LocalStorageOptions = {
      ...options,
      tempScale: options.tempScale === 'metric' ? 'imperial' : 'metric',
    }
    setStoredOptions(updateOptions).then(() => {
      setOptions(updateOptions)
    })
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
                {options.tempScale === 'metric' ? '\u2103' : '\u2109'}
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {options.homeCity != '' && (
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

// import React, { useEffect } from 'react'
// import ReactDOM from 'react-dom/client'
// import './popup.css'
// import { fetchOpenWeatherData } from '../utils/api'

// const App: React.FC<{}> = () => {
//   useEffect(() => {
//     fetchOpenWeatherData('Toronto')
//       .then((data) => {
//         console.log(data)
//         console.log('Temperature is:', data.main.temp)
//       })
//       .catch((err) => console.log(err))
//   }, [])

//   return (
//     <div>
//       <img src="icon.png" />
//     </div>
//   )
// }

// const rootElement = document.createElement('div')
// document.body.appendChild(rootElement)
// const root = ReactDOM.createRoot(rootElement)

// root.render(<App />)
