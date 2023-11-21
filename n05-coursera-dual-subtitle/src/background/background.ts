chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    dualTitleCoursera: false,
    language2ndCoursera: '',
  })
})
