import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import {
  DOWNLOAD_SUBTITLE,
  SHOW_ACTIVE,
  LANGUGAES_INFO,
  UDAL_MODE,
} from '../utils/messageType'

let ACTIVE_COUNT_MAX = 10
let TRANSLATE_DUAL = 'green'
let TRANSLATE_SINGLE = 'orange'
let TRANSLATE_DISABLE = 'gray'

// const downloadLanguage = 'zh-CN'
const filterFile = 'filterFile'
// const filterLanguage = 'zh-CN'
const filterLanguage = 'dual'
const downloadLanguage = 'en'
let timer = 0
let languages = []
let courseName = ''
let activerCount = 1
let dualMode = false

chrome.storage.sync.get(['dualTitleUCoursera'], (storage) => {
  if (
    storage.dualTitleUCoursera &&
    ['www.coursera.org'].includes(window.location.host)
  ) {
    console.log('found coursera....')
  }
})

function CourseState() {
  return (
    <>
      {/* <div id="course-show"></div> */}
      <div id="course-show-all">
        <div id="course-show-pic"> </div>
        <div id="course-show-text">ABC ..................</div>
      </div>
    </>
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
  // let languageElements = document.querySelectorAll('video track')
  // console.log(timer, 'languageElements:', languageElements)
  // for (let element of languageElements) {
  //   console.log(typeof element, element)
  // }

  let videoElement = document.querySelector('video')
  if (videoElement) {
    // console.log('found videoElement :', typeof videoElement)
    console.log('video :', videoElement.ariaLabel)

    //   let sourceElements = document.querySelectorAll('video source')
    //   console.log(sourceElements)
    //   for (let source of sourceElements as NodeListOf<HTMLTrackElement>) {
    //     console.log(source.src)
    //   }
  }

  const intervalId = setInterval(() => {
    const mainElement = document.querySelector('main div')
    if (mainElement) {
      console.log(mainElement)
    } else {
      console.log('mainElement no exist')
    }

    if (mainElement && mainElement.hasAttribute('role')) {
      console.log('role:', mainElement.getAttribute('role'))
    }
    // const videoElement = document.querySelector('video')
    // if (videoElement) {
    //   console.log(videoElement)
    // } else {
    //   console.log('videoElement no exist')
    // }

    let nameElement = document.querySelector('link[hreflang="x-default"]')
    if (nameElement) {
      courseName = nameElement.getAttribute('href')
      if (courseName.includes('lecture')) {
        console.log('lecture')
      } else {
        courseName = 'x'
        console.log('no lecture')
        // stop the interval
        clearInterval(intervalId)
      }

      let nameArray = courseName.split('/')
      if (nameArray.length > 0) {
        courseName = nameArray[nameArray.length - 1]
        console.log(courseName)
      }
    }

    let languageElements = document.querySelectorAll('video track')
    timer = timer + 1000
    console.log(` ${timer} ms, languageElements : `, languageElements)
    for (let element of languageElements as NodeListOf<HTMLTrackElement>) {
      // languages.push({ language: element.srclang, src: element.src })
      languages.push({
        label: element.label,
        srclang: element.srclang,
        src: element.src,
      })
    }
    if (languages.length > 0) {
      console.log('languages:', languages)

      // let activeLanguage = getActiveLanguage()
      // if (activeLanguage !== '') {
      //   if (getLenguageUri(activeLanguage) !== '') {
      //     // active subtitle

      //     chrome.storage.sync.get(
      //       ['language2ndCoursera', 'dualTitleUCoursera'],
      //       (res) => {
      //         console.log('sync.get:', res)

      //         if (res.language2ndCoursera !== '' && res.dualTitleUCoursera) {
      //           console.log(
      //             'combine:',
      //             res.dualTitleUCoursera,
      //             res.language2ndCoursera
      //           )
      //           console.log('activeLanguage:', activeLanguage, activerCount)

      //           if (getLenguageUri(res.language2ndCoursera) === '') {
      //             // active(single)
      //             dualMode = addCourseStateDiv(dualMode)
      //             setTranslateState(dualMode, TRANSLATE_SINGLE)

      //             console.log(languages)
      //             // stop the interval
      //             clearInterval(intervalId)
      //           } else {
      //             console.log(languages)
      //             // stop the interval
      //             clearInterval(intervalId)

      //             combine(activeLanguage, res.language2ndCoursera)

      //             dualMode = addCourseStateDiv(dualMode)
      //             setTranslateState(dualMode, TRANSLATE_DUAL)
      //           }
      //         }
      //       }
      //     )
      //   } else {
      //     // no active subtitle
      //     dualMode = addCourseStateDiv(dualMode)
      //     setTranslateState(dualMode, TRANSLATE_DISABLE)

      //     console.log(languages)
      //     // stop the interval
      //     clearInterval(intervalId)
      //   }
      // } else if (activerCount >= ACTIVE_COUNT_MAX) {
      //   // over times - no active subtitle
      //   dualMode = addCourseStateDiv(dualMode)
      //   setTranslateState(dualMode, TRANSLATE_DISABLE)

      //   console.log(languages)
      //   // stop the interval
      //   clearInterval(intervalId)
      // }
      // activerCount++

      chrome.storage.sync.get(
        ['language2ndCoursera', 'dualTitleUCoursera'],
        (res) => {
          console.log('sync.get:', res)

          if (res.language2ndCoursera !== '' && res.dualTitleUCoursera) {
            let activeLanguage = getActiveLanguage()
            console.log(
              'combine:',
              res.dualTitleUCoursera,
              res.language2ndCoursera
            )
            console.log('activeLanguage:', activeLanguage, activerCount)

            // active enable
            if (activeLanguage !== '') {
              combine(activeLanguage, res.language2ndCoursera)

              dualMode = addCourseStateDiv(dualMode)
              setTranslateState(dualMode, TRANSLATE_DUAL)

              console.log(languages)
              // stop the interval
              clearInterval(intervalId)

              // active disable
            } else {
              if (activerCount >= ACTIVE_COUNT_MAX) {
                dualMode = addCourseStateDiv(dualMode)
                setTranslateState(dualMode, TRANSLATE_DISABLE)

                console.log(languages)
                // stop the interval
                clearInterval(intervalId)
              }
              activerCount++
            }
          } else {
            // no enable
            dualMode = addCourseStateDiv(dualMode)

            let activeLanguage = getActiveLanguage()
            if (activeLanguage !== '') {
              setTranslateState(dualMode, TRANSLATE_SINGLE)
            } else {
              setTranslateState(dualMode, TRANSLATE_DISABLE)
            }

            console.log(languages)
            // stop the interval
            clearInterval(intervalId)
          }

          // if (res.language2ndCoursera) {
          //   setlanguageType2(res.language2ndCoursera)
          // }
          // console.log('setlanguageType2:', res.language2ndCoursera)

          // setDualMode(res.dualTitleUCoursera ? DUAL_ON : DUAL_OFF)
          // console.log('chrome.storage.sync.get...')
        }
      )
    }
  }, 1000)
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === DOWNLOAD_SUBTITLE) {
    sendResponse({ message: 'receive download chinese subtitle' })
    DownloadChineseSubtitle()
  } else if (message.message === SHOW_ACTIVE) {
    sendResponse({ message: 'receive show active' })
    ShowActive()
  } else if (message.message === LANGUGAES_INFO) {
    sendResponse({
      message: 'receive get languages info',
      courseName: courseName,
      languages: languages,
    })
  } else if (message.message === UDAL_MODE) {
    sendResponse({ message: 'doul mode setting' })
    console.log('UDAL_MODE....', message)
    if (message.secondLanguage !== '' && message.duleMode) {
      let activeLanguage = getActiveLanguage()
      console.log('combine:', activeLanguage, message.secondLanguage)
      if (activeLanguage !== '') {
        combine(activeLanguage, message.secondLanguage)
        setTranslateState(dualMode, TRANSLATE_DUAL)
      }
    }
  }
})

function DownloadChineseSubtitle() {
  let index = languages.findIndex((item) => item.srclang === downloadLanguage)
  // let index = languages.findIndex((item) => item.language === 'en')
  if (index !== -1) {
    console.log(languages[index])
    downloadChinesetitle(languages[index].src)
  } else {
    console.log(`not found ${downloadLanguage}`)
  }
}

function downloadChinesetitle(subtitleUri) {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', subtitleUri, false)
  xhr.send()
  if (xhr.status === 200) {
    console.log(xhr.responseText)
    chrome.runtime.sendMessage({
      message: DOWNLOAD_SUBTITLE,
      name: courseName,
      lenguage: downloadLanguage,
      subtitle: xhr.responseText,
    })
  } else {
    throw new Error('Network response was not ok')
  }
}

function ShowActive() {
  const activeElement = document.querySelector('li.active span')
  if (activeElement) {
    console.log('activeElement:', activeElement)
    let ariaLabel = activeElement.getAttribute('aria-label')
    console.log('aria-label:', ariaLabel)

    let actickTrackElement = document.querySelector(
      `track[label="${ariaLabel}"]`
    )
    if (actickTrackElement) {
      console.log('actickTrackElement:', actickTrackElement)
    } else {
      console.log('no active track ...')
    }
  } else {
    console.log('no active subtitle ...')
  }
  combine('English', '汉字 (自动)')
}

function combine(firstLanguage, secondLanguage) {
  let contenSubtitle1 = loadSubtitle(getLenguageUri(secondLanguage))
  let contenSubtitle2 = loadSubtitle(getLenguageUri(firstLanguage))
  // let contenSubtitle2 = loadSubtitle(getLenguageUri('汉字 (自动)'))
  // let contenSubtitle1 = loadSubtitle(getLenguageUri('English'))
  let linesSutitle1 = contenSubtitle1.split('\n')
  let linesSutitle2 = contenSubtitle2.split('\n')
  let linesLength1 = linesSutitle1.length
  let linesLength2 = linesSutitle2.length
  let linesSutitleItems1 = countSubtitleItems(linesSutitle1)
  let linesSutitleItems2 = countSubtitleItems(linesSutitle2)
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

  console.log('combine:', firstLanguage, secondLanguage)
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
      // console.log('timestemp1:', timestemp1)
      continue
    } else if (linesSutitle1[i].length === 0) {
      if (i != 1) {
        // console.log(subtitleIndex1, contentItem1)
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
      // console.log(subtitleIndex1, contentItem1)
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

    // console.log('-------------------')
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
        // console.log('timestemp2:', timestemp2)
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
        if (j != 1) {
          // console.log(subtitleIndex2, contentItem2)
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
        // console.log(subtitleIndex2, contentItem2)
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
        // console.log('  ===================')
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

  // chrome.runtime.sendMessage({
  //   message: DOWNLOAD_SUBTITLE,
  //   name: filterFile,
  //   lenguage: filterLanguage,
  //   subtitle: content,
  // })
}

function countSubtitleItems(lineSubtitle) {
  const length = lineSubtitle.length
  let items = 0

  for (let i = 0; i < 10; i++) {
    // const dataNumber()
    if (Number(lineSubtitle[length - 1 - i]) > 0) {
      items = Number(lineSubtitle[length - 1 - i])
      break
    }
  }
  return items
}

function getLenguageUri(language) {
  let subtitleUrl = ''
  let trackElement = document.querySelector(
    `track[label="${language}"]`
  ) as HTMLTrackElement
  if (getLenguageUri) {
    console.log(`"${language}" typeof trackElement:`, typeof trackElement)
    console.log(`"${language}" trackElement:`, trackElement)
    console.log(`"${language}" trackElement.src:`, trackElement.src)
    if (trackElement.hasAttribute('data-src')) {
      subtitleUrl = trackElement.getAttribute('data-src')
    } else {
      subtitleUrl = trackElement.src
    }
  } else {
    console.log('no ', language)
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
    console.log('activeElement:', activeElement)
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

function getActiveLanguage() {
  const activeElement = document.querySelector('li.active span')
  if (activeElement) {
    // console.log('activeElement:', activeElement)
    return activeElement.getAttribute('aria-label')
  }
  return ''
}

// contentScript.js

// Function to handle link clicks
function handleLinkClick(event) {
  console.log('=====================================')
  console.log('handleLinkClick', event)
  console.log('URI', event.target.baseURI)
  if (event.target.baseURI.includes('lecture')) {
    console.log('includes lecture...')
  }
  // // Check if the clicked element is a link (anchor tag)
  // if (event.target.tagName === 'A') {
  //   // Perform actions based on the link click
  //   console.log('Link clicked:', event.target.href);

  //   // You can modify this part to check if the clicked link is a "next" link
  //   // and take appropriate actions.
  // }
}

// Attach the click event listener to the entire document
document.addEventListener('click', handleLinkClick)

function setTranslateState(dualMode, state) {
  if (dualMode) {
    const tranlateElement = document.getElementById('course-show-pic')
    tranlateElement.style.backgroundColor = state
  }
}
