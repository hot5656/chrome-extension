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
})

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
  }
})
