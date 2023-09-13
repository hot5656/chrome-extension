import { fetchOpenWeatherData } from '../utils/api'
import {
  getStoredCities,
  setStoredCities,
  getStoredOptions,
  setStoredOptions,
} from '../utils/storage'

chrome.runtime.onInstalled.addListener(() => {
  setStoredCities([])
  setStoredOptions({
    hasAutoOverlay: false,
    homeCity: '',
    tempScale: 'metric',
  })

  // context menu %?%
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Add city to weather extension',
    id: 'weatherExtension',
  })

  // alarm %?%
  chrome.alarms.create({
    // periodInMinutes: 60,
    // 10 sec
    periodInMinutes: 10 / 60,
  })
})

// context menu %?%
chrome.contextMenus.onClicked.addListener((event) => {
  getStoredCities().then((cities) => {
    setStoredCities([...cities, event.selectionText])
  })
})

// alarm %?%
chrome.alarms.onAlarm.addListener(() => {
  getStoredOptions().then((options) => {
    if (options.homeCity === '') {
      return
    }

    fetchOpenWeatherData(options.homeCity, options.tempScale).then((data) => {
      const temp = Math.round(data.main.temp)
      const symbol = options.tempScale === 'metric' ? '\u2103' : '\u2109'

      // chrome extension badge %?%
      chrome.action.setBadgeText({
        text: `${temp}${symbol}`,
      })
    })
  })
})
