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

// chrome.action.onClicked.addListener(() => {
//   chrome.storage.sync.get(['doubleTitleUdemy'], (res) => {
//     chrome.storage.sync.set(
//       {
//         doubleTitleUdemy: !res.doubleTitleUdemy,
//       },
//       () => {
//         chrome.action.setIcon({
//           // %?% path 最前面要加 /
//           path: `${!res.doubleTitleUdemy ? 'icon' : 'icon_off'}.png`,
//         })
//       }
//     )

//     // show result
//     chrome.storage.sync.get(['doubleTitleUdemy'], (res) => {
//       console.log('chrome.storage.sync', res)
//     })

//     // reload tabs
//     chrome.tabs.reload()
//   })
// })

// chrome.storage.onChanged.addListener(function (changes, areaName) {
//   console.log('changes', changes)
//   console.log('areaName', areaName) // sync
//   for (let key in changes) {
//     let storageChange = changes[key]
//     console.log(
//       'Key "%s" changed. ' + 'Old value was "%s", new value is "%s".',
//       key,
//       storageChange.oldValue,
//       storageChange.newValue
//     )
//   }
// })

// back wait message, then response
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message)
//   sendResponse({ message: 'Response from background JS' })
// })

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.changeIcon) {
    const iconPath = chrome.runtime.getURL(request.newIconPath)
    chrome.action.setIcon({ path: iconPath })
  }
  console.log('request', request)
})

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Send a message to the content script
    chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' })
  }
  console.log('changeInfo', changeInfo)
})
