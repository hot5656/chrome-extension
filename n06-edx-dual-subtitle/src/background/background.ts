chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    dualTitleEdx: false,
    language2ndEdx: '',
  })
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'get iframe content') {
    fetch(request.url, { mode: 'no-cors' })
      .then((res) => {
        console.log('res', res)
        res.text()
      })
      .then((data) => sendResponse({ content: data }))

    return true
  }

  // if (request.message === 'to background') {
  //   console.log(request)
  //   const tabId = sender.tab.id
  //   chrome.scripting.executeScript(
  //     {
  //       target: { tabId: tabId },
  //       // @ts-ignore
  //       function: (() => {
  //         const iframe = document.querySelector('iframe')
  //         const doc = iframe?.contentDocument
  //         console.log('iframe', iframe)
  //         return iframe
  //         // return doc?.body.innerText
  //       }) as () => any,
  //     },
  //     (result) => {
  //       // result will contain iframe body innerText
  //       console.log(result)
  //     }
  //   )

  // chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  //   if (changeInfo.status == 'complete') {
  //     chrome.tabs.executeScript(
  //       tabId,
  //       {
  //         code: `const iframe = document.querySelector('iframe');
  // 						 const doc = iframe.contentDocument;
  // 						 doc.body.innerText`,
  //       },
  //       (result) => {
  //         // result will contain iframe body innerText
  //         console.log(result[0])
  //       }
  //     )
  //   }
  // })
  // }
})

// type ExecuteScriptFunction = () => any

// const executeScriptFunction: ExecuteScriptFunction = () => {
//   const iframe = document.querySelector('iframe')
//   const doc = iframe?.contentDocument
//   return doc?.body.innerText
// }

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status == 'complete') {
//     console.log(changeInfo)
//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabId },
//         // @ts-ignore
//         function: (() => {
//           const iframe = document.querySelector('iframe')
//           const doc = iframe?.contentDocument
//           return doc?.body
//           // return doc?.body.innerText
//         }) as () => any,
//       },
//       (result) => {
//         // result will contain iframe body innerText
//         console.log(result)
//       }
//     )
//   }
// })

// type ExecuteScriptFunction = (result: any[]) => any

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log('tabId:', tabId)
//   console.log('changeInfo:', changeInfo)
//   console.log('tab:', tab)

//   if (changeInfo.status == 'complete') {
//     console.log('complete..............')

//     const executeScriptFunction: ExecuteScriptFunction = (result) => {
//       const iframe = document.querySelector('iframe')
//       const doc = iframe?.contentDocument
//       return doc?.body.innerText
//     }

//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabId },
//         function: executeScriptFunction,
//       },
//       (result) => {
//         // result will contain iframe body innerText
//         console.log('result:', result[0])
//       }
//     )
//   }
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log('tabId:', tabId)
//   console.log('changeInfo:', changeInfo)
//   console.log('tab:', tab)

//   if (changeInfo.status == 'complete') {
//     console.log('complete..............')

//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabId },
//         function: (result: any[]) => {
//           const iframe = document.querySelector('iframe')
//           const doc = iframe?.contentDocument
//           return doc?.body.innerText
//         },
//       },
//       (result) => {
//         // result will contain iframe body innerText
//         console.log('result:', result[0])
//       }
//     )
//   }
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log('tabId:', tabId)
//   console.log('changeInfo:', changeInfo)
//   console.log('tab:', tab)

//   if (changeInfo.status == 'complete') {
//     console.log('complete..............')

//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabId },
//         function: (result: any[]) => {
//           const iframe = document.querySelector('iframe')
//           const doc = iframe.contentDocument
//           return doc.body.innerText
//         },
//       },
//       (result) => {
//         // result will contain iframe body innerText
//         console.log('result:', result[0])
//       }
//     )
//   }
// })

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log('tabId:', tabId)
//   console.log('changeInfo:', changeInfo)
//   console.log('tab:', tab)
//   if (changeInfo.status == 'complete') {
//     console.log('complete..............')

//     chrome.tabs.executeScript(
//       tabId,
//       {
//         code: `const iframe = document.querySelector('iframe');
// 						 const doc = iframe.contentDocument;
// 						 doc.body`,
//       },
//       (result) => {
//         // result will contain iframe body innerText
//         console.log('result:', result[0])
//       }
//     )
//   }
// })

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.getNestedIframeContent) {
//     fetch(request.url)
//       .then((res) => res.text())
//       .then((data) => sendResponse({ content: data }))

//     return true
//   }
// })

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.getIframeContent) {
//     let url = request.iframeUrl

//     fetch(url, { mode: 'no-cors' })
//       .then((response) => {
//         console.log('response', response)
//         response.text()
//       })
//       .then((data) => {
//         console.log('response', data)
//         sendResponse({ content: data })
//       })

//     return true
//   }
// })

// // background.js

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === 'getIframeContent') {
//     // Check if the request includes the iframe source URL
//     const iframeSrc = request.iframeSrc

//     if (!iframeSrc) {
//       console.error('Missing iframe source URL in the request.')
//       return
//     }

//     // Use fetch API to fetch the iframe content
//     fetch(iframeSrc, { mode: 'no-cors' })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch iframe content. Status: ${response.status}`
//           )
//         }
//         return response.text()
//       })
//       .then((iframeContent) => {
//         // Send the iframe content back to the content script
//         sendResponse({ iframeContent: iframeContent })
//       })
//       .catch((error) => {
//         console.error(error.message)
//       })

//     // Return true to indicate that sendResponse will be called asynchronously
//     return true
//   }
// })

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === 'getIframeContent') {
// 		console.log("getIframeContent")
//     // Check if the request includes the iframe source URL
//     const iframeSrc = request.iframeSrc

//     if (!iframeSrc) {
//       console.error('Missing iframe source URL in the request.')
//       return
//     }

//     // Use XMLHttpRequest to fetch the iframe content
//     const xhr = new XMLHttpRequest()
//     xhr.onreadystatechange = function () {
//       if (xhr.readyState === XMLHttpRequest.DONE) {
//         if (xhr.status === 200) {
//           // Send the iframe content back to the content script
//           sendResponse({ iframeContent: xhr.responseText })
//         } else {
//           console.error('Failed to fetch iframe content. Status:', xhr.status)
//         }
//       }
//     }

//     // Open and send the request to fetch the iframe content
//     xhr.open('GET', iframeSrc, true)
//     xhr.send()

//     console.log('xhr.responseText', xhr.responseText)
//     // Return true to indicate that sendResponse will be called asynchronously
//     return true
//   }
// })

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === 'getCurrentTabInfo') {
//     // Query information about the current tab
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       const currentTab = tabs[0]

//       chrome.tabs.sendMessage(
//         currentTab.id,
//         { action: 'getTabInfo' },
//         function (response) {
//           sendResponse({ tabInfo: currentTab, iframes: response.iframes })
//         }
//       )

//       // // Get iframes within the current tab's content
//       // chrome.webNavigation.getAllFrames(
//       //   { tabId: currentTab.id },
//       //   function (details) {
//       //     const iframes = details.filter(
//       //       (frame) => frame.frameId > 0 && frame.parentFrameId === 0
//       //     )

//       //     // Send the information back to the content script
//       //     sendResponse({ tabInfo: currentTab, iframes: iframes })
//       //   }
//       // )
//     })

//     // Return true to indicate that sendResponse will be called asynchronously
//     return true
//   }
// })
