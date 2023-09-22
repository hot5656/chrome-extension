chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    doubleTitle: true,
  })
})

chrome.action.onClicked.addListener(() => {
  chrome.storage.sync.get(['doubleTitle'], (res) => {
    chrome.storage.sync.set(
      {
        doubleTitle: !res.doubleTitle,
      },
      () => {
        chrome.action.setIcon({
          // %?% path 最前面要加 /
          path: `/images/${!res.doubleTitle ? 'icon160' : 'icon160_off'}.png`,
        })
      }
    )

    // show result
    chrome.storage.sync.get(['doubleTitle'], (res) => {
      console.log('chrome.storage.sync', res)
    })

    // reload tabs
    chrome.tabs.reload()
  })
})
