import { OpenWeatherTempScale } from './api'

// set LocalStorage interface
export interface LocalStorage {
  cities?: string[]
  options?: LocalStorageOptions
}

export interface LocalStorageOptions {
  hasAutoOverlay: boolean
  homeCity: string
  tempScale: OpenWeatherTempScale
}

export type LocalStorageKeys = keyof LocalStorage

// set/get options
export function setStoredCities(cities: string[]): Promise<void> {
  const vals: LocalStorage = {
    cities,
  }
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export function getStoredCities(): Promise<string[] | []> {
  const keys: LocalStorageKeys[] = ['cities']
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      // 若無 res.cities 傳回 [] %?%
      resolve(res.cities ?? [])
    })
  })
}

// set/get option
export function setStoredOptions(options: LocalStorageOptions): Promise<void> {
  const vals: LocalStorage = {
    options,
  }
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve()
    })
  })
}

export function getStoredOptions(): Promise<LocalStorageOptions> {
  const keys: LocalStorageKeys[] = ['options']
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res: LocalStorage) => {
      resolve(res.options)
    })
  })
}
