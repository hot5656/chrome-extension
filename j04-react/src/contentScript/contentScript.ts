// console.log('contentScript running!')

chrome.runtime.sendMessage('From the content script!', (response) => {
  console.log(response)
})
