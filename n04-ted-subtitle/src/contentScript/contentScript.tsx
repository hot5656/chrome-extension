let talkId = ''
let raw = null
let data = null
let playerData = null
let vtt = null

raw = document.querySelector('#__NEXT_DATA__').textContent
if (raw) {
  data = JSON.parse(raw)
  if (data) {
    playerData = JSON.parse(data.props.pageProps.videoData.playerData)
  }
}

console.log('talkId get :', data.props.pageProps.videoData.id)
console.log(document.querySelector('video'))
// TODO: content script
console.log('Ted Extract Subtitle running!')

// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  console.log('load...')
  // console.log(document.querySelectorAll('#__NEXT_DATA__')[0].text)

  // const raw = document.querySelector('#__NEXT_DATA__').textContent
  // const data = JSON.parse(raw)

  // console.log(data)
  // console.log(data.props.pageProps.videoData)
  // console.log('----------1')
  // console.log(data.props.pageProps.videoData.playerData)
  // console.log('----------2')
  // let playerData = JSON.parse(data.props.pageProps.videoData.playerData)
  if (document.querySelector('video track')) {
    vtt = document.querySelector('video track').getAttribute('src')
  }
  console.log(playerData.resources.h264[0].file)
  console.log(vtt)
  // console.log(data.props.pageProps.videoData.playerData['file'])
  // console.log('----------3')
  // const json = JSON.parse(raw)
  // talkId = document.querySelector('#comments div').getAttribute('data-post-id')
  // talkId = data.props.pageProps.videoData.id

  // {
  //   const videoPlayer = document.querySelector('video')
  //   console.log('videoPlayer --> ', videoPlayer)

  //   const track = document.createElement('track')
  //   track.kind = 'subtitles'
  //   track.label = 'Dual'
  //   track.src = 'https://hls.ted.com/project_masters/8727/subtitles/en/full.vtt'
  //   track.srclang = 'zh'
  //   videoPlayer.appendChild(track)

  //   const dualTrack = videoPlayer.querySelector(
  //     '[label="Dual"]'
  //   ) as HTMLTrackElement

  //   if (dualTrack) {
  //     dualTrack.track.mode = 'showing'
  //   }
  // }
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

    const mainElement = document.querySelector(
      'main#maincontent'
    ) as HTMLElement
    // mainElement.classList.replace('pt-14', 'pt-28')
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
      console.log('---------------------------------------')
      console.log(event.target.files[0])
      const subtitleUrl = URL.createObjectURL(event.target.files[0])
      console.log('subtitleUrl:', subtitleUrl)
      // console.log(vttData)
      console.log('---------------------------------------')

      const trackElement = document.querySelector(
        'track[kind="subtitles"]'
      ) as HTMLTrackElement
      trackElement.src = subtitleUrl
      console.log(trackElement)

      // Now you can use vttData, which contains the content of the selected .vtt file
      // You can then proceed to update your video's subtitles as needed
    }

    reader.readAsText(selectedFile)
  }
}

function triggerGenerateSubtitle(offsetMs) {
  let titleUrl = document
    .querySelector('#comments div')
    .getAttribute('data-post-url')
    .split('/')
  let title = titleUrl[titleUrl.length - 1]

  // const talkId = document
  //   .querySelector('#comments div')
  //   .getAttribute('data-post-id')

  // console.log(talkId)
  // console.log(title)
  let dualSubtitle = add2ndSubtitle(getTedSubtitle(talkId))
  // console.log(dualSubtitle)

  // send subtitle to background.js
  chrome.runtime.sendMessage({
    message: 'subtitle',
    title: title,
    idTalk: talkId,
    offsetMs: offsetMs,
    subtitle: dualSubtitle,
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
    // console.log(data.captions)
  } else {
    throw new Error('Network response was not ok')
  }
  return subtitles
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
    // console.log('Message received in content script:', message)
    triggerGenerateSubtitle(message.offsetMs)
  } else if (message.message === 'get talkId') {
    console.log('get talkId:', message)
    console.log('message', message)
    console.log('sender', sender)

    // const talkId = document
    //   .querySelector('#comments div')
    //   .getAttribute('data-post-id')

    // const raw = document.querySelector('#__NEXT_DATA__').textContent
    // const data = JSON.parse(raw)
    // console.log(data)

    if (document.querySelector('video track')) {
      vtt = document.querySelector('video track').getAttribute('src')
    }

    console.log('talkId get :', data.props.pageProps.videoData.id)
    sendResponse({
      talkId: data ? data.props.pageProps.videoData.id : '',
      videoUrl: playerData ? playerData.resources.h264[0].file : '',
      subtitle: vtt ? vtt : '',
    })
  } else if (message.message === 'local subtitle') {
    const trackElement = document.querySelector(
      'track[kind="subtitles"]'
    ) as HTMLTrackElement
    trackElement.src = message.url
    console.log('send local subtitle : ', message.url)
  }
})
