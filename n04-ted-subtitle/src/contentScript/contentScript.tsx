// TODO: content script
console.log('Ted Extract Subtitle running!')

// when all page load complete, set data-language, and get langeage from chrome storge
window.addEventListener('load', function () {
  console.log('load...')
})

function triggerGenerateSubtitle(offsetMs) {
  let titleUrl = document
    .querySelector('#comments div')
    .getAttribute('data-post-url')
    .split('/')
  let title = titleUrl[titleUrl.length - 1]

  const talkId = document
    .querySelector('#comments div')
    .getAttribute('data-post-id')
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
  }
})
