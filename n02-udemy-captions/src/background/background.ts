chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    doubleTitleUdemy: true,
    languageTypeUdemy: 'zh-Hant',
  })
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
//           path: `${!res.doubleTitleUdemy ? 'icon' : 'icon160_off'}.png`,
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
    // console.log(iconPath)
  }
})
