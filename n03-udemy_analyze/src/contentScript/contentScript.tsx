let pageIndex = 0
const MAX_PAGE = 5

window.addEventListener('load', function () {
  console.log('load...')
})

function getCourses() {
  let courseTitleElements = document.querySelectorAll(
    '.my-courses__course-card-grid h3 a'
  )

  let courses: { title: string; url: string }[] = []

  for (let element of courseTitleElements) {
    if (element instanceof HTMLAnchorElement) {
      let href = element.href.replace(
        /course-dashboard-redirect\/\?course_id=/g,
        'course/'
      )

      courses.push({
        title: '"' + element.textContent + '"',
        url: href,
      })
    }
  }

  // console.log(courses)
  return courses
}

function clickNextButton() {
  let next = true

  const nextButton = document.querySelector(
    '.pagination-module--next--1CIKT'
  ) as HTMLElement | null

  next = !JSON.parse(nextButton.getAttribute('aria-disabled'))

  if (next) {
    if (nextButton) {
      nextButton?.click()
    } else {
      console.log('No "Next" button found or end of pagination reached.')
    }
  }

  return next
}

function sendCourseMessage(index) {
  let courses = getCourses()
  chrome.runtime.sendMessage({
    message: 'course',
    courses: courses,
    pageIndex: index,
  })
  console.log('index=', index)

  return courses.length
}

function sendCourseMessageLast() {
  chrome.runtime.sendMessage({
    message: 'course',
    courses: [],
    pageIndex: -1,
  })
}

function processPage(index) {
  setTimeout(() => {
    let listLength = sendCourseMessage(pageIndex)

    if (listLength != 0) {
      // if (pageIndex < MAX_PAGE - 1) {
      pageIndex = pageIndex + 1
      if (clickNextButton()) {
        processPage(index)
      } else {
        sendCourseMessageLast()
      }
      // } else {
      //   sendCourseMessageLast()
      // }
    } else {
      processPage(index)
    }
  }, 2000)
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'my courses') {
    // console.log('Message received in content script:', message)
    pageIndex = 0
    processPage(pageIndex)
  }
})
