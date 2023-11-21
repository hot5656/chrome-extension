import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import { SHOW_ACTIVE, LANGUGAES_INFO, UDAL_MODE } from '../utils/messageType'

let ACTIVE_COUNT_MAX = 10
let TRANSLATE_DUAL = 'green'
let TRANSLATE_SINGLE = 'orange'
let TRANSLATE_DISABLE = 'gray'
let TRANSLATE_DUAL_TEXT = 'Dual Subtitle'
let TRANSLATE_SINGLE_TEXT = 'Single Subtitle'
let TRANSLATE_DISABLE_TEXT = 'Disable Subtitle'

let timer = 0
let languages = []
let courseName = ''
let activerCount = 1
let dualMode = false
let activeMode = TRANSLATE_DISABLE
let active2ndLanguage = ''

function CourseState() {
  return (
    <div id="course-show-all">
      <div id="course-show-pic"> </div>
      <div id="course-show-text"> </div>
    </div>
  )
}

// add add course state div
function addCourseStateDiv(dual) {
  let success = dual ? true : false
  if (!dual) {
    const firstChild = document.querySelector('.header-right-nav-wrapper')
    if (firstChild) {
      success = true

      const bodyElement = document.querySelector('.c-container')
      const rootElement = document.createElement('div')
      rootElement.id = 'course-satae'
      rootElement.className = 'horizontal-box'
      bodyElement.insertBefore(rootElement, firstChild)

      const root = createRoot(rootElement)
      root.render(<CourseState />)
    }
  }
  return success
}

window.addEventListener('load', function () {
  console.log('contentScript load...')
  checkInterval()
})

function checkInterval() {
  const intervalId = setInterval(() => {
    let nameElement = document.querySelector('link[hreflang="x-default"]')
    if (nameElement) {
      courseName = nameElement.getAttribute('href')
      if (!courseName.includes('lecture')) {
        courseName = 'x'
        console.log('no lecture')
        // stop the interval
        clearInterval(intervalId)
      }

      let nameArray = courseName.split('/')
      if (nameArray.length > 0) {
        courseName = nameArray[nameArray.length - 1]
        // console.log(courseName)
      }
    }

    let languageElements = document.querySelectorAll('video track')
    timer = timer + 1000
    // console.log(` ${timer} ms, languageElements : `, languageElements)
    languages = []
    for (let element of languageElements as NodeListOf<HTMLTrackElement>) {
      languages.push({
        label: element.label,
        srclang: element.srclang,
        src: element.src,
      })
    }
    if (languages.length > 0) {
      // console.log('languages:', languages)

      let activeLanguage = getActiveLanguage()
      if (activeLanguage !== '') {
        dualMode = addCourseStateDiv(dualMode)

        // found active state
        if (getLenguageUri(activeLanguage) !== '') {
          // active subtitle

          chrome.storage.sync.get(
            ['language2ndCoursera', 'dualTitleCoursera'],
            (res) => {
              // console.log('sync.get:', res)

              if (res.language2ndCoursera !== '' && res.dualTitleCoursera) {
                // console.log(
                //   'combine:',
                //   res.dualTitleCoursera,
                //   res.language2ndCoursera
                // )
                // console.log('activeLanguage:', activeLanguage, activerCount)

                if (getLenguageUri(res.language2ndCoursera) === '') {
                  // active(single)
                  dualMode = addCourseStateDiv(dualMode)
                  setTranslateState(dualMode, TRANSLATE_SINGLE, '')
                  // active2ndLanguage = ''
                  // activeMode = TRANSLATE_SINGLE

                  // console.log(languages)
                  // stop the interval
                  clearInterval(intervalId)
                } else {
                  // console.log(languages)
                  // stop the interval
                  clearInterval(intervalId)

                  combine(activeLanguage, res.language2ndCoursera)

                  dualMode = addCourseStateDiv(dualMode)
                  setTranslateState(
                    dualMode,
                    TRANSLATE_DUAL,
                    res.language2ndCoursera
                  )
                  // active2ndLanguage = res.language2ndCoursera
                  // activeMode = TRANSLATE_DUAL
                }
              } else {
                // not set dual at storage
                // active(single)
                dualMode = addCourseStateDiv(dualMode)
                setTranslateState(dualMode, TRANSLATE_SINGLE, '')
                // let active2ndLanguage = ''
                // activeMode = TRANSLATE_SINGLE

                // console.log(languages)
                // stop the interval
                clearInterval(intervalId)
              }
            }
          )
        } else {
          // no active subtitle
          dualMode = addCourseStateDiv(dualMode)
          setTranslateState(dualMode, TRANSLATE_DISABLE, '')
          // let active2ndLanguage = ''
          // activeMode = TRANSLATE_DISABLE

          // console.log(languages)
          // stop the interval
          clearInterval(intervalId)
        }
      } else if (activerCount >= ACTIVE_COUNT_MAX) {
        // over times - no active subtitle
        dualMode = addCourseStateDiv(dualMode)
        setTranslateState(dualMode, TRANSLATE_DISABLE, '')
        // active2ndLanguage = ''
        // activeMode = TRANSLATE_DISABLE

        // console.log(languages)
        // stop the interval
        clearInterval(intervalId)
      }
      activerCount++
    }
  }, 1000)
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === LANGUGAES_INFO) {
    sendResponse({
      // message: 'receive get languages info', - no show
      message: '',
      courseName: courseName,
      languages: languages,
    })
  } else if (message.message === UDAL_MODE) {
    // sendResponse({ message: 'dual mode setting' }) - no show
    sendResponse({ message: '' })
    // console.log('DUAL_MODE....', message)
    if (message.secondLanguage !== '' && message.duleMode) {
      if (message.duleMode) {
        let activeLanguage = getActiveLanguage()
        // console.log('combine:', activeLanguage, message.secondLanguage)
        if (activeLanguage !== '') {
          if (
            activeMode !== TRANSLATE_DUAL ||
            message.secondLanguage !== active2ndLanguage
          ) {
            combine(activeLanguage, message.secondLanguage)
            setTranslateState(dualMode, TRANSLATE_DUAL, message.secondLanguage)
            // active2ndLanguage = message.secondLanguage
            // activeMode = TRANSLATE_DUAL
          }
        }
      }
    } else {
      if (activeMode == TRANSLATE_DUAL) {
        setTranslateState(dualMode, TRANSLATE_SINGLE, '')
        // activeMode = TRANSLATE_SINGLE
        setSingleSubtitle()
      }
    }
  }
})

function combine(firstLanguage, secondLanguage) {
  let contenSubtitle1 = loadSubtitle(getLenguageUri(secondLanguage))
  let contenSubtitle2 = loadSubtitle(getLenguageUri(firstLanguage))
  let linesSutitle1 = contenSubtitle1.split('\n')
  let linesSutitle2 = contenSubtitle2.split('\n')
  let linesLength1 = linesSutitle1.length
  let linesLength2 = linesSutitle2.length
  let content = ''
  let index = 1
  let contentItem1 = ''
  let contentItem2 = ''
  let foundItem1 = false
  let foundItem2 = false
  let timestemp1 = 0
  let timestemp2 = 0
  let timestempStr1 = ''
  let timestempStr2 = ''
  let subtitleIndex1 = '0'
  let subtitleIndex2 = '0'
  let i = 0
  let j = 1

  // console.log('combine:', firstLanguage, secondLanguage)
  for (; i < linesLength1; i++) {
    if (i === 0) {
      content = linesSutitle1[0] + '\n'
      continue
    } else if (Number(linesSutitle1[i]) > 0) {
      subtitleIndex1 = `(${linesSutitle1[i]}) `
      continue
    } else if (linesSutitle1[i].includes('-->')) {
      timestempStr1 = linesSutitle1[i]
      timestemp1 = Number(
        linesSutitle1[i].split(' --> ')[0].replace(/[:.]/g, '')
      )
      continue
    } else if (linesSutitle1[i].length === 0) {
      if (i !== 1) {
        foundItem1 = false
      } else {
        continue
      }
    } else if (i === linesLength1 - 1) {
      if (foundItem1) {
        contentItem1 = contentItem1 + ' ' + linesSutitle1[i]
      } else {
        contentItem1 = linesSutitle1[i]
      }
      foundItem1 = false
    } else {
      if (foundItem1) {
        contentItem1 = contentItem1 + ' ' + linesSutitle1[i]
      } else {
        contentItem1 = linesSutitle1[i]
      }
      foundItem1 = true
      continue
    }

    while (j < linesLength2) {
      if (Number(linesSutitle2[j]) > 0) {
        subtitleIndex2 = `(${linesSutitle2[j]}) `
        j++
        continue
      } else if (linesSutitle2[j].includes('-->')) {
        timestempStr2 = linesSutitle2[j]
        timestemp2 = Number(
          linesSutitle2[j].split(' --> ')[0].replace(/[:.]/g, '')
        )
        if (timestemp1 < timestemp2) {
          content =
            content +
            '\n' +
            index.toString() +
            '\n' +
            timestempStr1 +
            '\n' +
            contentItem1 +
            '\n'
          index++

          break
        }
        j++
        continue
      } else if (linesSutitle2[j].length === 0) {
        if (j !== 1) {
          foundItem2 = false
        } else {
          j++
          continue
        }
      } else if (j === linesLength2 - 1) {
        if (foundItem2) {
          contentItem2 = contentItem2 + ' ' + linesSutitle2[j]
        } else {
          contentItem2 = linesSutitle2[j]
        }
        foundItem2 = false
      } else {
        if (foundItem2) {
          contentItem2 = contentItem2 + ' ' + linesSutitle2[j]
        } else {
          contentItem2 = linesSutitle2[j]
        }
        foundItem2 = true
        j++
        continue
      }
      j++
      if (timestemp1 === timestemp2) {
        content =
          content +
          '\n' +
          index.toString() +
          '\n' +
          timestempStr1 +
          '\n' +
          contentItem1 +
          '\n' +
          contentItem2 +
          '\n'
        index++
        break
      } else if (timestemp1 > timestemp2) {
        content =
          content +
          '\n' +
          index.toString() +
          '\n' +
          timestempStr2 +
          '\n' +
          contentItem2 +
          '\n'
        index++
      }
    }
  }

  setDualSubtitle(content)
}

function getLenguageUri(language) {
  let subtitleUrl = ''
  let trackElement = document.querySelector(
    `track[label="${language}"]`
  ) as HTMLTrackElement
  if (trackElement) {
    // console.log(`"${language}" typeof trackElement:`, typeof trackElement)
    // console.log(`"${language}" trackElement:`, trackElement)
    // console.log(`"${language}" trackElement.src:`, trackElement.src)
    if (trackElement.hasAttribute('data-src')) {
      subtitleUrl = trackElement.getAttribute('data-src')
    } else {
      subtitleUrl = trackElement.src
    }
  } else {
    // console.log('no ', language)
  }
  return subtitleUrl
}

function loadSubtitle(subtitleUrl) {
  let content = ''
  if (subtitleUrl !== '') {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', subtitleUrl, false)
    xhr.send()
    if (xhr.status === 200) {
      content = xhr.responseText
    }
  }
  return content
}

function setDualSubtitle(subtitle) {
  // Create a Blob from the WebVTT content
  const blob = new Blob([subtitle], { type: 'text/vtt' })
  // Create a data URL from the Blob
  const dataUrl = URL.createObjectURL(blob)

  const activeElement = document.querySelector('li.active span')
  if (activeElement) {
    // console.log('activeElement:', activeElement)
    let ariaLabel = activeElement.getAttribute('aria-label')
    let trackElement = document.querySelector(
      `track[label="${ariaLabel}"]`
    ) as HTMLTrackElement
    if (trackElement) {
      if (!trackElement.hasAttribute('data-src')) {
        trackElement.setAttribute('data-src', trackElement.src)
      }
      trackElement.src = dataUrl
    }
  }
}

function setSingleSubtitle() {
  const activeElement = document.querySelector('li.active span')
  if (activeElement) {
    let ariaLabel = activeElement.getAttribute('aria-label')
    let trackElement = document.querySelector(
      `track[label="${ariaLabel}"]`
    ) as HTMLTrackElement
    if (trackElement) {
      if (trackElement.hasAttribute('data-src')) {
        trackElement.setAttribute('src', trackElement.getAttribute('data-src'))
      }
    }
  }
}

function getActiveLanguage() {
  const activeElement = document.querySelector('li.active span')
  if (activeElement) {
    return activeElement.getAttribute('aria-label')
  }
  return ''
}

// Function to handle link clicks
function handleLinkClick(event) {
  let isRun = false
  // console.log('=====================================')
  // console.log('handleLinkClick', event)

  if (event.target.className === 'subtitle-label') {
    checkActiveChange()
    isRun = true
  } else if ('childNodes' in event.target) {
    if (event.target.childNodes.length >= 2) {
      if (event.target.childNodes[1].className === 'subtitle-label') {
        checkActiveChange()
        isRun = true
      }
    }
  }

  if (!isRun) {
    setTimeout(() => {
      // console.log('class:', event.target.className)
      // console.log('url:', event.target.baseURI)
      if (
        event.target.className.includes('cds') &&
        event.target.baseURI.includes('lecture')
      ) {
        checkInterval()
      }
    }, 300)
  }
}

function checkActiveChange() {
  setTimeout(() => {
    let activeLanguage = getActiveLanguage()
    let languageUri = getLenguageUri(activeLanguage)
    if (languageUri === '') {
      setTranslateState(dualMode, TRANSLATE_DISABLE, '')
      // active2ndLanguage = ''
      // activeMode = TRANSLATE_DISABLE
    } else {
      chrome.storage.sync.get(
        ['language2ndCoursera', 'dualTitleCoursera'],
        (res) => {
          if (res.language2ndCoursera !== '' && res.dualTitleCoursera) {
            // dual mode
            if (getLenguageUri(res.language2ndCoursera) === '') {
              setTranslateState(dualMode, TRANSLATE_SINGLE, '')
              // active2ndLanguage = ''
              // activeMode = TRANSLATE_SINGLE
            } else {
              combine(activeLanguage, res.language2ndCoursera)

              setTranslateState(
                dualMode,
                TRANSLATE_DUAL,
                res.language2ndCoursera
              )
              // active2ndLanguage = res.language2ndCoursera
              // activeMode = TRANSLATE_DUAL
            }
          } else {
            setTranslateState(dualMode, TRANSLATE_SINGLE, '')
            // active2ndLanguage = ''
            // activeMode = TRANSLATE_SINGLE
          }
        }
      )
    }
  }, 500)
}

// Attach the click event listener to the entire document
document.addEventListener('click', handleLinkClick)

function setTranslateState(dualMode, state, language) {
  activeMode = state
  active2ndLanguage = language
  if (dualMode) {
    const tranlateElement = document.getElementById('course-show-pic')
    if (tranlateElement) {
      tranlateElement.style.backgroundColor = state
    } else {
      // console.log("Element with ID 'course-show-pic' not found.")
    }

    const translateTextElement = document.getElementById('course-show-text')
    if (translateTextElement) {
      if (state === TRANSLATE_DUAL) {
        translateTextElement.textContent = TRANSLATE_DUAL_TEXT
      } else if (state === TRANSLATE_SINGLE) {
        translateTextElement.textContent = TRANSLATE_SINGLE_TEXT
      } else {
        translateTextElement.textContent = TRANSLATE_DISABLE_TEXT
      }
    }
  }
}
