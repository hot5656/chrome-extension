let talkId = ''
let titleUrl = []
let videoUrl = ''
let vttUrl = ''
let vttStartMs = 0

// TODO: content script
console.log('Ted Extract Subtitle running!')

// when all page load complete
window.addEventListener('load', function () {
  let raw = null
  let data = null
  let playerData = null
  console.log('load...')

  // get talkId, titleUrl, videoUrl
  raw = document.querySelector('#__NEXT_DATA__').textContent
  if (raw) {
    data = JSON.parse(raw)
    // console.log('data:', data)
    if (data) {
      playerData = JSON.parse(data.props.pageProps.videoData.playerData)
      // console.log('playerData:', playerData)
      talkId = data.props.pageProps.videoData.id
      titleUrl = playerData.canonical.split('/')
      videoUrl = playerData.resources.h264[0].file
    }
  }
  // get vttUrl
  if (document.querySelector('video track')) {
    vttUrl = document.querySelector('video track').getAttribute('src')
  }
  console.log('talkId get :', talkId)

  // get vtt start ms
  vttStartMs = getVttOffsetMs(vttUrl)

  // add file input
  {
    // Create an input element
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.vtt'

    // Attach an event listener to handle file selection
    fileInput.addEventListener('change', handleSubtitleFileChange)

    const headElement = document.querySelector('header')
    // Append the input element to the document or a specific container
    headElement.appendChild(fileInput)

    // change paddingTop
    const mainElement = document.querySelector(
      'main#maincontent'
    ) as HTMLElement
    mainElement.style.paddingTop = '7rem'
  }
})

// Event handler to handle file selection
function handleSubtitleFileChange(event) {
  const selectedFile = event.target.files[0]

  if (selectedFile) {
    // Handle the selected file, e.g., read its contents
    const reader = new FileReader()

    reader.onload = function (e) {
      const vttData = e.target.result
      const subtitleUrl = URL.createObjectURL(event.target.files[0])

      let trackElement = document.querySelector(
        'track[srclang="en"]'
      ) as HTMLTrackElement
      if (!trackElement) {
        trackElement = document.querySelector(
          'track[kind="subtitles"]'
        ) as HTMLTrackElement
      }
      trackElement.src = subtitleUrl

      // console.log(event.target.files[0])
      // console.log('subtitleUrl:', subtitleUrl)
      // console.log(trackElement)

      // Now you can use vttData, which contains the content of the selected .vtt file
      // You can then proceed to update your video's subtitles as needed
    }

    reader.readAsText(selectedFile)
  }
}

function triggerGenerateSubtitle() {
  let title = titleUrl.length != 0 ? titleUrl[titleUrl.length - 1] : ''

  let dualSubtitle = add2ndSubtitle(getTedSubtitle(talkId))
  console.log('title : ', title)
  console.log(dualSubtitle)

  // send subtitle to background.js
  chrome.runtime.sendMessage({
    message: 'subtitle',
    title: title,
    idTalk: talkId,
    subtitle: dualSubtitle,
    vttStartMs: vttStartMs,
  })
}

function getTedSubtitle(id) {
  let xhr = new XMLHttpRequest()
  let subtitles = []

  xhr.open('GET', `https://www.ted.com/talks/subtitles/id/${id}/lang/en`, false)
  xhr.send()

  if (xhr.status === 200) {
    let data = JSON.parse(xhr.responseText)
    subtitles = data.captions
  } else {
    throw new Error('Network response was not ok')
  }
  return subtitles
}

function getVttOffsetMs(vtt) {
  let xhr = new XMLHttpRequest()
  let vttMs = 0

  xhr.open('GET', vtt, false)
  xhr.send()

  if (xhr.status === 200) {
    let lines = xhr.responseText.split('\n')
    if (lines.length >= 3) {
      vttMs = Number(lines[2].replace(/\./g, '').split('-->')[0].split(':')[2])
      console.log('vttStartMs :', vttMs)
    }
  } else {
    throw new Error('Network response was not ok')
  }
  return vttMs
}

function add2ndSubtitle(subtitles) {
  let language_code = 'zh-Hant'

  subtitles.forEach(function (title, index) {
    let newWords = ''
    let originalWords = title.content
    let xhr = new XMLHttpRequest()

    if (title.content.includes('%')) {
      title.content = title.content.replace(/%/g, 'percent')
    }

    xhr.open(
      'GET',
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${title.content}`,
      false
    )
    xhr.send()

    if (xhr.status === 200) {
      let data = JSON.parse(xhr.responseText)
      newWords = data[0][0][0]
      subtitles[index].content = newWords + '\n' + originalWords
      if (index % 10 == 0) {
        console.log(newWords)
      }
    } else {
      throw new Error('Network response was not ok')
    }
  })

  return subtitles
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.message === 'generate subtitle') {
    console.log('Message received in content script:', message)
    triggerGenerateSubtitle()
  }
})
