chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    dualTitleUCoursera: true,
    language1stCoursera: 'zh-Hant',
    language2ndCoursera: 'en',
  })
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.changeIcon) {
    const iconPath = chrome.runtime.getURL(request.newIconPath)
    chrome.action.setIcon({ path: iconPath })
    // console.log(iconPath)
  }
})
