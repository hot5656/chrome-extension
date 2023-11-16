import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'

const downloadLanguage = 'zh-CN'
const filterFile = 'filterFile'
// const filterLanguage = 'zh-CN'
const filterLanguage = 'dual'
// const downloadLanguage = 'en'
let timer = 0
let languages = []
let courseName = ''

chrome.storage.sync.get(['dualTitleUCoursera'], (storage) => {
  if (
    storage.dualTitleUCoursera &&
    ['www.coursera.org'].includes(window.location.host)
  ) {
    console.log('found coursera....')
  }
})

function App() {
  function handleSubtitleFileChange(event) {
    const selectedFile = event.target.files[0]

    if (selectedFile) {
      const reader = new FileReader()

      reader.onload = function (e) {
        const vttData = e.target.result
        const subtitleUrl = URL.createObjectURL(event.target.files[0])

        console.log('subtitleUrl:', subtitleUrl)

        let trackElement = document.querySelector(
          'track[srclang="en"]'
        ) as HTMLTrackElement
        if (trackElement) {
          trackElement.src = subtitleUrl
          console.log('trackElement:', trackElement)
        }
      }

      reader.readAsText(selectedFile)
    }
  }

  return <input type="file" accept=".vtt" onChange={handleSubtitleFileChange} />
}

// add load div
function addUploadDiv() {
  const firstChild = document.querySelector('.align-items-vertical-center')
  // console.log('firstChild', firstChild)
  if (firstChild) {
    const bodyElement = document.querySelector('.c-container')
    const rootElement = document.createElement('div')
    rootElement.id = 'insert-div'
    // console.log(bodyElement)
    // console.log(rootElement)
    bodyElement.insertBefore(rootElement, firstChild)

    const root = createRoot(rootElement)
    root.render(<App />)
  }
}

window.addEventListener('load', function () {
  console.log('contentScript load...')
  // let languageElements = document.querySelectorAll('video track')
  // console.log(timer, 'languageElements:', languageElements)
  // for (let element of languageElements) {
  //   console.log(typeof element, element)
  // }

  const intervalId = setInterval(() => {
    let nameElement = document.querySelector('link[hreflang="x-default"]')
    if (nameElement) {
      courseName = nameElement.getAttribute('href')
      let nameArray = courseName.split('/')
      if (nameArray.length > 0) {
        courseName = nameArray[nameArray.length - 1]
      }
    }

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
    let languageElements = document.querySelectorAll('video track')
    timer = timer + 1000
    console.log(` ${timer} ms, languageElements : `, languageElements)
    for (let element of languageElements as NodeListOf<HTMLTrackElement>) {
      // languages.push({ language: element.srclang, src: element.src })
      languages.push({ label: element.label, srclang: element.srclang })
    }
    if (languages.length > 0) {
      addUploadDiv()
      console.log(languages)
      // stop the interval
      clearInterval(intervalId)
    }
  }, 1000)
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'download chinese subtitle') {
    sendResponse({ message: 'receive download chinese subtitle' })
    DownloadChineseSubtitle()
  } else if (message.message === 'show active') {
    sendResponse({ message: 'receive show active' })
    ShowActive()
  }
})

function DownloadChineseSubtitle() {
  let index = languages.findIndex((item) => item.language === downloadLanguage)
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
      message: 'chinese subtitle',
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
  combine()
}

function combine() {
  let contenSubtitle1 = loadSubtitle(getLenguageUri('汉字 (自动)'))
  let contenSubtitle2 = loadSubtitle(getLenguageUri('English'))
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
      console.log('timestemp1:', timestemp1)
      continue
    } else if (linesSutitle1[i].length === 0) {
      if (i != 1) {
        console.log(subtitleIndex1, contentItem1)
        // contentItem1 = ''
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
      console.log(subtitleIndex1, contentItem1)
      // contentItem1 = ''
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

    console.log('-------------------')
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
        console.log('timestemp2:', timestemp2)
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
          console.log(subtitleIndex2, contentItem2)
          // contentItem2 = ''
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
        console.log(subtitleIndex2, contentItem2)
        // contentItem2 = ''
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
        console.log('  ===================')
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
  //   message: 'chinese subtitle',
  //   name: filterFile,
  //   lenguage: filterLanguage,
  //   subtitle: content,
  // })

  // process 1st subtitle the save to the file
  // for (let i = 0; i < linesLength1; i++) {
  //   if (i === 0) {
  //     content = linesSutitle1[0] + '\n\n'
  //   } else if (Number(linesSutitle1[i]) > 0) {
  //     content = content + index.toString() + '\n'
  //     index++
  //   } else if (linesSutitle1[i].includes('-->')) {
  //     let timestemp = Number(
  //       linesSutitle1[i].split(' --> ')[0].replace(/[:.]/g, '')
  //     )
  //     console.log('timestemp1:', linesSutitle1[i].split(' --> '))
  //     console.log(
  //       'timestemp2:',
  //       linesSutitle1[i].split(' --> ')[0].replace(/[:.]/g, '')
  //     )
  //     console.log('timestemp:', timestemp)
  //     content = content + linesSutitle1[i] + '\n'
  //   } else if (linesSutitle1[i].length === 0) {
  //     if (index != 1) {
  //       console.log(`(${index - 1}):`, contentItem)
  //       content = content + contentItem + '\n\n'
  //     }
  //     contentItem = ''
  //     foundItem = false
  //   } else if (i === linesLength1 - 1) {
  //     if (foundItem) {
  //       contentItem = contentItem + ' ' + linesSutitle1[i]
  //     } else {
  //       contentItem = linesSutitle1[i]
  //     }
  //     console.log(`(${index - 1}):`, contentItem)
  //     content = content + contentItem + '\n'
  //     contentItem = ''
  //     foundItem = false
  //   } else {
  //     if (foundItem) {
  //       contentItem = contentItem + ' ' + linesSutitle1[i]
  //     } else {
  //       contentItem = linesSutitle1[i]
  //     }
  //     foundItem = true
  //   }

  // }

  // chrome.runtime.sendMessage({
  //   message: 'chinese subtitle',
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
    subtitleUrl = trackElement.src
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
    let actickTrackElement = document.querySelector(
      `track[label="${ariaLabel}"]`
    ) as HTMLTrackElement
    if (actickTrackElement) {
      actickTrackElement.src = dataUrl
    }
  }
}
