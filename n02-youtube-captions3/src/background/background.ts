chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    doubleTitleYoutube2: true,
    languageTypeYoutube2: 'zh-Hant',
  })
})

chrome.action.onClicked.addListener(() => {
  chrome.storage.sync.get(['doubleTitleYoutube2'], (res) => {
    chrome.storage.sync.set(
      {
        doubleTitleYoutube2: !res.doubleTitleYoutube2,
      },
      () => {
        chrome.action.setIcon({
          // %?% path 最前面要加 /
          path: `${!res.doubleTitleYoutube2 ? 'icon160' : 'icon160_off'}.png`,
        })
      }
    )

    // show result
    chrome.storage.sync.get(['doubleTitleYoutube2'], (res) => {
      console.log('chrome.storage.sync', res)
    })

    // reload tabs
    chrome.tabs.reload()
  })
})

chrome.storage.onChanged.addListener(function (changes, areaName) {
  console.log('changes', changes)
  console.log('areaName', areaName) // sync
  for (let key in changes) {
    let storageChange = changes[key]
    console.log(
      'Key "%s" changed. ' + 'Old value was "%s", new value is "%s".',
      key,
      storageChange.oldValue,
      storageChange.newValue
    )
  }
})

// back wait message, then response
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message)
//   sendResponse({ message: 'Response from background JS' })
// })
