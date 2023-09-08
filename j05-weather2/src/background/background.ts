import { fetchOpenWeatherData } from '../utils/api'

fetchOpenWeatherData('tapei', 'metric')
  .then((data) => {
    console.log(`${data.name}`, data)
  })
  .catch((err) => console.log('Error:', err))
