import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/roboto'
import './popup.css'
// mean import index
import WeatherCard from './WeatherCard'

const App: React.FC<{}> = () => {
  return (
    <div>
      <WeatherCard city="Toronto" />
      <WeatherCard city="New York" />
      <WeatherCard city="Error" />
    </div>
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
