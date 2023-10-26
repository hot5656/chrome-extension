chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    doubleTitleYoutube: true,
    languageTypeYoutube: 'zh-Hans',
    translateMode: 'Youtube', // OnLine
  })
})

// chrome.action.onClicked.addListener(() => {
//   chrome.storage.sync.get(['doubleTitleYoutube'], (res) => {
//     chrome.storage.sync.set(
//       {
//         doubleTitleYoutube: !res.doubleTitleYoutube,
//       },
//       () => {
//         chrome.action.setIcon({
//           // %?% path 最前面要加 /
//           path: `${!res.doubleTitleYoutube ? 'icon' : 'icon_off'}.png`,
//         })
//       }
//     )

//     // show result
//     chrome.storage.sync.get(['doubleTitleYoutube'], (res) => {
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
