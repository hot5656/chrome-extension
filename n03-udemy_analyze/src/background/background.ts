// console.log('Background Script')
// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

let fileName = ''
let csvContent = ''

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log('chrome.runtime.onMessage....')
  // console.log(request)
  // Create the formatted date string

  if (request.message === 'course') {
    let courses = request.courses

    console.log('pageIndex=', request.pageIndex)
    console.log(courses)

    if (courses.length > 0) {
      // Extract keys
      const keys = Object.keys(courses[0])

      if (request.pageIndex === 0) {
        // Convert to CSV string
        csvContent = keys.join(',') + '\n'
      }

      // process data
      courses.forEach((row) => {
        let rowArr = []
        keys.forEach((key) => {
          rowArr.push(row[key])
        })
        csvContent += rowArr.join(',') + '\n'
      })

      // console.log(csvContent)
    }

    if (request.pageIndex === -1) {
      const formattedDate = `${year}_${month}${day}`
      fileName = `my_courses_${formattedDate}.csv`

      // Create a Blob with the UTF-8 BOM and CSV content
      const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv' })

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
            }
          )
        } else {
          // Handle the case where dataURL is not a string (e.g., if there's an error)
          console.error('Failed to create data URL')
        }
      }
      reader.readAsDataURL(blob)

      // simple UTF-8 format
      // chrome.downloads.download(
      //   {
      //     url: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent),
      //     filename: fileName,
      //   },
      //   function (downloadId) {
      //     // Handle the download initiation, if needed
      //   }
      // )
    }
  }
})

// Create a new Date object for the current date
const today = new Date()

// Get the current year, month, and day
const year = today.getFullYear()
const month = String(today.getMonth() + 1).padStart(2, '0') // Month is zero-based, so add 1
const day = String(today.getDate()).padStart(2, '0')
