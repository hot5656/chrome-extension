// lucy_mcbath_my_quest_to_end_the_horror_of_gun_violence_in_the_us_119527
const offMs = 3500

// console.log('Background Script')
// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log('chrome.runtime.onMessage....')
  // console.log(request)
  // Create the formatted date string

  if (request.message === 'subtitle') {
    let content = ''
    console.log(request.title)
    console.log(request.idTalk)
    console.log(request.subtitle)

    request.subtitle.forEach(function (item, index) {
      let itemData = ''
      let timeStart = parseInt(item.startTime, 10) + offMs
      let timeEnd =
        parseInt(item.startTime, 10) + parseInt(item.duration, 10) + offMs
      // console.log(msToTime(timeStart), ' --> ', msToTime(timeEnd))
      itemData =
        (index + 1).toString() +
        '\n' +
        msToTime(timeStart) +
        ' --> ' +
        msToTime(timeEnd) +
        '\n' +
        request.subtitle[index].content +
        '\n\n'
      content = content + itemData
      // console.log(itemData)
    })
    // request.subtitle.forEach(funtion (item) {
    // 	console.log(item)
    // })

    saveFile(`${request.title}_${request.idTalk}.srt`, content)
  }
})

function msToTime(ms) {
  const mss = ms % 1000
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  // Use string formatting to ensure the time components have two digits
  const formattedHours = String(hours).padStart(2, '0')
  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')
  const formattedMss = String(mss).padStart(3, '0')

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds},${formattedMss}`
}

function saveFile(fileName, content) {
  console.log('fileName:', fileName)

  // Create a Blob containing the text content
  // for str must  type: 'text/srt' (txt is type: 'text/plain')
  const blob = new Blob([content], { type: 'text/srt' })

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
            console.log('Download initiated with ID:', downloadId)
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
