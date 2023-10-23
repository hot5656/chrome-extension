// const url_subtitle = 'vtt-c.cdn.com'
const url_subtitle = '/api/timedtext'

// sned http request, save data to map
const setMap = function (response) {
  let map = []
  const lines = response.split('\n')
  let i = 1
  let newItem = false
  let language_code = 'zh-Hant'

  // get language
  try {
    const languageDiv = document.getElementById('language-show')
    language_code = languageDiv.getAttribute('data-language')
    console.log('   data-language:', language_code)
  } catch (e) {
    console.log('event:', e)
    console.log('   data-language: not found')
  }

  let resJson = JSON.parse(response)
  console.log(resJson)
  // console.log(resJson.events[0].segs[0].utf8)

  resJson.events.forEach(function (event, index) {
    // console.log(event.segs[0].utf8 + "\n")

    let newWords = ''
    let xhr = new XMLHttpRequest()
    xhr.open(
      'GET',
      // `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language_code}&dt=t&q=${element}`,
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${event.segs[0].utf8}`,
      false
    )
    xhr.send()

    if (xhr.status === 200) {
      let data = JSON.parse(xhr.responseText)
      newWords = data[0][0][0]
      // console.log(newWords + "\n")

      // resJson.event[].segs[index].utf8 = resJson.event.segs[index].utf8 + "\n" + newWords
      // map.push(newWords)
      resJson.events[index].segs[0].utf8 = newWords + '\n' + event.segs[0].utf8
    } else {
      throw new Error('Network response was not ok')
    }
  })

  // lines.forEach((element, index) => {
  //   let newWords = ''
  //   if (newItem) {
  //     let xhr = new XMLHttpRequest()
  //     xhr.open(
  //       'GET',
  //       // `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language_code}&dt=t&q=${element}`,
  //       `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${element}`,
  //       false
  //     )
  //     xhr.send()

  //     if (xhr.status === 200) {
  //       let data = JSON.parse(xhr.responseText)
  //       newWords = data[0][0][0]
  //       map.push(newWords)
  //     } else {
  //       throw new Error('Network response was not ok')
  //     }
  //   }

  //   if (element.includes('-->')) {
  //     newItem = true
  //   } else {
  //     newItem = false
  //   }
  // })
  // return map
  return JSON.stringify(resJson)
}

const processEvents = function (events) {
  let map = new Map()
  let pre = null
  console.log(events)
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
  console.log(events)
  return events
}

let getResult = function (response) {
  // Robert(2023/10/12) : change from xhook to ajax-hook
  let resJson = JSON.parse(response)
  let language_code = 'zh-Hant'

  // console.log('-------------------')
  // console.log(resJson.events)
  // console.log('-------------------')

  // get language
  try {
    const languageDiv = document.getElementById('language-show')
    language_code = languageDiv.getAttribute('data-language')
    console.log('   data-language:', language_code)
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
      xhr.open(
        'GET',
        // `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${language_code}&dt=t&q=${element}`,
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language_code}&dt=t&q=${event.segs[0].utf8}`,
        false
      )
      xhr.send()

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText)
        newWords = data[0][0][0]
        // console.log(newWords + "\n")

        // resJson.event[].segs[index].utf8 = resJson.event.segs[index].utf8 + "\n" + newWords
        // map.push(newWords)
        event.segs[0].utf8 = newWords + '\n' + event.segs[0].utf8
      } else {
        throw new Error('Network response was not ok')
      }

      // if (event && event.segs) {
      //   event.segs = mergerSegs(event.segs, event, map)
      // }
      events.push(event)
      console.log(event.segs[0].utf8 + '\n')
    }
  })

  resJson.events = events
  // console.log(resJson.events)
  return JSON.stringify(resJson)
}

let getResult2 = function (map, response) {
  const lines = response.split('\n')
  let i = 0
  let newItem = false

  lines.forEach((element, index) => {
    if (newItem) {
      lines[index] = map[i] + '\n' + element
      i = i + 1
    }

    if (element.includes('-->')) {
      newItem = true
      // if (i % 10 == 0) {
      //   console.log(element + '\n')
      // }
    } else {
      newItem = false
    }
  })

  response = lines.join('\n')
  return response
}

// when all page load complete, add xhook
window.addEventListener('load', function () {
  console.log('load......')
})

ah.proxy({
  //請求發起前進入
  onRequest: (config, handler) => {
    if (config.url.includes(url_subtitle)) {
      console.log('--------------------------------------')
      console.log(config.url)
    }
    handler.next(config)
  },
  //請求發生錯誤時進入，例如超時；注意，不包括http狀態碼錯誤，如404仍然會認為請求成功
  onError: (err, handler) => {
    console.log(err.type)
    handler.next(err)
  },
  //請求成功後進入
  onResponse: (response, handler) => {
    if (response.config.url.includes(url_subtitle)) {
      const params = new URLSearchParams(response.config.url)
      let lang = (params.get('lang') || '').toLocaleLowerCase()
      console.log('lang=', lang)
      console.log(response.config.url)

      // let resJson = JSON.parse(response.response)
      // console.log(resJson)
      // let map = setMap(response.response)
      // response.response = getResult(map, response.response)

      // if (lang === 'en') {
      if (lang != '') {
        // processEvents(response.response.events)
        response.response = getResult(response.response)
        // console.log(response.response)
      }

      // response.response = setMap(response.response)
    }
    handler.next(response)
  },
})
