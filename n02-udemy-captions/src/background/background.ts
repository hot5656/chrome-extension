chrome.runtime.onInstalled.addListener((details) => {
  console.log('background installed', details)

  chrome.storage.sync.set(
    {
      subtitleModeUdemy: 'Dual',
      language2ndUdemy: 'zh-Hant',
    },
    function () {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      } else {
        console.log('Data successfully saved')
      }
    }
  )
})

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // console.log('changeInfo_in', changeInfo)
    // check only support url
    if (tab.url.match('https://www.udemy.com/')) {
      // Send a message to the content script
      chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' })
    }
  }
  // console.log('tab:', tab)
  // console.log('changeInfo', changeInfo)
})
