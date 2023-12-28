chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set(
    {
      subtitleModeYoutube: 'Dual',
      language2ndYoutube: 'zh-Hant',
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        // } else {
        //   console.log('Data successfully saved')
      }
    }
  )
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.changeIcon) {
    const iconPath = chrome.runtime.getURL(request.newIconPath)
    chrome.action.setIcon({ path: iconPath })
    // console.log(iconPath)
  }
})

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // console.log('changeInfo_in', changeInfo)
    // check only support url
    if (tab.url.match('https://www.youtube.com/watch')) {
      // Send a message to the content script
      chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' })
    }
  }
  // console.log('tab:', tab)
  // console.log('changeInfo', changeInfo)
})
