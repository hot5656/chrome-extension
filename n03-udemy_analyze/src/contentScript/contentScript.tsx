let pageIndex = 0
const MAX_PAGE = 3

window.addEventListener('load', function () {
  console.log('load.....1')
  console.log('window.location.host', window.location.host)
  console.log('window.location', window.location)
  console.log('load.....2')
  pageIndex = 0

  processPage(pageIndex)
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

  console.log(courses)
  return courses
}

function clickNextButton() {
  const nextButton = document.querySelector(
    '.pagination-module--next--1CIKT'
  ) as HTMLElement | null
  console.log('nextButton', nextButton)
  if (nextButton) {
    nextButton?.click()
  } else {
    console.log('No "Next" button found or end of pagination reached.')
  }
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

function processPage(index) {
  setTimeout(() => {
    let listLength = sendCourseMessage(pageIndex)

    if (pageIndex < MAX_PAGE - 1) {
      if (listLength != 0) {
        pageIndex = pageIndex + 1
        clickNextButton()
      }
      processPage(index)
    }
  }, 2000)
}
