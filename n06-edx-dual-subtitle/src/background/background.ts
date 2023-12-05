chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    subtitleModeEdx: 'Dual',
    language2ndEdx: 'zh-Hant',
  })
})
