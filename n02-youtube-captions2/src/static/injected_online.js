const url_subtitle = '/api/timedtext'

const processEvents = function (events) {
  let map = new Map()
  let pre = null
  // console.log(events)
  events.forEach((e) => {
    if (e.segs && e.segs.length > 0) {
      if (!pre) pre = e
      if (!e.aAppend && e.tStartMs >= pre.tStartMs + pre.dDurationMs) {
        pre = e
      }
      e.segs = [{ utf8: e.segs.map((seg) => seg.utf8).join('') }]
      let cc = map.get(pre.tStartMs)
      if (!cc) {
        cc = []
      }
      cc.push(e)
      map.set(pre.tStartMs, cc)
    }
  })

  events = []
  map.forEach((e) => {
    events.push(
      Object.assign({}, e[0], {
        segs: [
          {
            utf8: e
              .map((c) => c.segs[0].utf8)
              .join('')
              .replace(/\n/g, ' '),
          },
        ],
      })
    )
  })
  // console.log(events)
  return events
}

let getResult = function (response) {
  let resJson = JSON.parse(response.text)
  let language_code = 'zh-Hans'

  // get language
  try {
    const languageDiv = document.getElementById('language-show')
    language_code = languageDiv.getAttribute('data-language')
    // console.log('   data-language:', language_code)
  } catch (e) {
    console.log('event:', e)
    console.log('   data-language: not found')
  }

  // 英文 segs array 文字接在一起
  resJson.events = processEvents(resJson.events)

  let events = []
  resJson.events.forEach(function (event) {
    delete event.wWinId
    if (
      !(event.segs && event.segs.length === 1 && event.segs[0].utf8 === '\n')
    ) {
      let newWords = ''
      let xhr = new XMLHttpRequest()
      // fix % translate error
      let originalWords = event.segs[0].utf8
      if (event.segs[0].utf8.includes('%')) {
        event.segs[0].utf8 = event.segs[0].utf8.replace(/%/g, 'percent')
      }

      xhr.open(
        'GET',
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${event.segs[0].utf8}`,
        false
      )
      xhr.send()

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText)
        newWords = data[0][0][0]
        event.segs[0].utf8 = newWords + '\n' + originalWords
      } else {
        throw new Error('Network response was not ok')
      }

      events.push(event)
      // console.log(event.segs[0].utf8 + '\n')
    }
  })

  resJson.events = events
  // console.log(resJson.events)
  return JSON.stringify(resJson)
}

// window.addEventListener('load', function () {
//   console.log('load......injected_online.js')
// })

xhook.after(function (request, response) {
  let url = request.url

  // console.log('url:', url)
  if (url.includes(url_subtitle)) {
    console.log('response.text', response.text)
    // const params = new URLSearchParams(url)
    // let lang = (params.get('lang') || '').toLocaleLowerCase()
    // let tlang = (params.get('tlang') || '').toLocaleLowerCase()

    // // lang 原語言, tlang 翻譯語言
    // // console.log('lang:', lang, 'tlang:', tlang)
    // if (lang != '') {
    //   // let map = setMap(undefined, url)
    //   response.text = getResult(response)
    // }
  }
})
