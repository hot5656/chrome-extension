// console.log('Background Script')
// TODO: background script
chrome.runtime.onInstalled.addListener(() => {
  // TODO: on installed function
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // console.log('chrome.runtime.onMessage....')
  // console.log(request)
  let fileName = ''
  let csvContent = ''

  if (request.message === 'course') {
    let courses = request.courses

    console.log('pageIndex=', request.pageIndex)
    console.log(courses)

    if (courses.length > 0) {
      fileName = `courses_${request.pageIndex + 1}.csv`

      // Extract keys
      const keys = Object.keys(courses[0])
      // Convert to CSV string
      csvContent = keys.join(',') + '\n'
      // process data
      courses.forEach((row) => {
        let rowArr = []
        keys.forEach((key) => {
          rowArr.push(row[key])
        })
        csvContent += rowArr.join(',') + '\n'
      })

      chrome.downloads.download(
        {
          url: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent),
          filename: fileName,
        },
        function (downloadId) {
          // Handle the download initiation, if needed
        }
      )
    }
  }
})
