chrome.runtime.onInstalled.addListener(() => {
  console.log('background installed')
  chrome.storage.sync.set({
    dualTitleUCoursera: true,
    language1stCoursera: 'zh-Hant',
    language2ndCoursera: 'en',
  })
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'chinese subtitle') {
    console.log(request)
    saveFile(`${request.title}.vtt`, request.subtitle)
  }
})

function saveFile(fileName, content) {
  console.log('fileName:', fileName)

  // Create a Blob containing the text content
  // for str must  type: 'text/srt' (txt is type: 'text/plain')
  const blob = new Blob([content], { type: 'text/vtt' })

  // Convert the Blob to a data URL
  const reader = new FileReader()
  reader.onload = function () {
    const dataURL: string | ArrayBuffer | null = reader.result
    if (typeof dataURL === 'string') {
      // Use the chrome.downloads.download API to initiate the download
      chrome.downloads.download(
        {
          url: dataURL,
          filename: fileName,
        },
        function (downloadId) {
          // Handle the download initiation, if needed
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError)
          } else {
            // console.log('Download initiated with ID:', downloadId)
          }
        }
      )
    } else {
      // Handle the case where dataURL is not a string (e.g., if there's an error)
      console.error('Failed to create data URL')
    }
  }
  reader.readAsDataURL(blob)
}
