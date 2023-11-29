chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    dualTitleEdx: false,
    language2ndEdx: '',
  })
})
