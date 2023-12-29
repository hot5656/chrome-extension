// 中文將 segs array 文字接在一起
const mergerSegs = function (segs, event, map) {
  if (segs) {
    let utf8 = segs.map((seg) => seg.utf8).join('')
    let val = map && map.get(`${event.tStartMs}_${event.dDurationMs}`)
    if (val) {
      utf8 = `${val[0].utf8}\n${utf8}`
    }
    return [
      {
        utf8,
      },
    ]
  } else {
    return [
      {
        utf8: '',
      },
    ]
  }
}

// sned http request, save data to map
// 本程式使用時 userLang : undefined
const setMap = function (userLang, url) {
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

  // send 同步
  let xhr = new XMLHttpRequest()
  xhr.open(
    'GET',
    userLang ? userLang.baseUrl : `${url}&tlang=${language_code}`,
    false
  )
  xhr.send()

  // 同步收資料, 存入 map
  let map = new Map()

  // some time receive html response, not parse
  const isHtmlString = xhr.response.includes('<html>')
  // console.log('xhr.response.includes("<html>" :', isHtmlString)
  if (!isHtmlString) {
    JSON.parse(xhr.response).events.forEach((event) => {
      // 若有 segs 則存於 map
      if (event.segs) {
        map.set(
          `${event.tStartMs}_${event.dDurationMs}`,
          mergerSegs(event.segs)
        )
        // console.log(
        //   'map.set:',
        //   `${event.tStartMs}_${event.dDurationMs}`,
        //   mergerSegs(event.segs)
        // )
      }
    })
  }
  return map
}

// 英文將 segs array 文字接在一起
const processEvents = function (events) {
  let map = new Map()
  let pre = null

  events.forEach((e) => {
    if (e.segs && e.segs.length > 0) {
      if (e.segs.length === 1 && e.segs[0].utf8 === '\n') {
        // console.log("not data.. ")
      } else {
        // let st = ''
        // e.segs.forEach(seg => {
        //   if (st !== '') {
        //     st = st + ' '
        //   }
        //   st = st + seg.utf8
        // })
        // console.log("st:", st)
        // e.segs = [{
        //   utf8: st
        // }]

        e.segs = [
          {
            utf8: e.segs.map((seg) => seg.utf8).join(''),
          },
        ]
        // console.log(" e.segs: ", e.segs)
        map.set(e.tStartMs, e)
      }
    }
  })

  // console.log('map:', map)

  let tempEvents = []
  let nexTimestamp = 0
  let temSeg = map.forEach((e) => {
    if (e.tStartMs > nexTimestamp && nexTimestamp !== 0) {
      let eTemp = JSON.parse(JSON.stringify(e))
      eTemp.tStartMs = nexTimestamp
      eTemp.dDurationMs = e.tStartMs - eTemp.tStartMs
      eTemp.segs[0].utf8 = ''
      eTemp.next = eTemp.tStartMs + eTemp.dDurationMs

      if (eTemp.hasOwnProperty('wWinId')) {
        tempEvents.push(
          Object.fromEntries(
            Object.entries(eTemp).filter(([key]) => key !== 'wWinId')
          )
        )
      } else {
        tempEvents.push(eTemp)
      }
    }

    if (e.hasOwnProperty('wWinId')) {
      e.next = e.tStartMs + e.dDurationMs
      tempEvents.push(
        Object.fromEntries(
          Object.entries(e).filter(([key]) => key !== 'wWinId')
        )
      )
    } else {
      tempEvents.push(e)
    }

    nexTimestamp = e.tStartMs + e.dDurationMs
  })
  // console.log('tempEvents:', tempEvents)

  let dataLength = tempEvents.length
  events = []
  for (let i = 0; i < dataLength; i++) {
    if (i + 1 === dataLength) {
      events.push(tempEvents[i])
    } else if (
      tempEvents[i + 1].tStartMs <
      tempEvents[i].tStartMs + tempEvents[i].dDurationMs
    ) {
      tempEvents[i].segs[0].utf8 =
        tempEvents[i].segs[0].utf8 + ' ' + tempEvents[i + 1].segs[0].utf8
      events.push(tempEvents[i])
      i++
    } else {
      events.push(tempEvents[i])
    }
  }
  // console.log('events:', events)

  return events
}

const processEvents_default = function (events) {
  let map = new Map()
  let pre = null
  events.forEach((e) => {
    if (e.segs && e.segs.length > 0) {
      if (!pre) pre = e
      if (!e.aAppend && e.tStartMs >= pre.tStartMs + pre.dDurationMs) {
        pre = e
      }
      e.segs = [
        {
          utf8: e.segs.map((seg) => seg.utf8).join(''),
        },
      ]
      let cc = map.get(pre.tStartMs)
      if (!cc) {
        cc = []
      }
      cc.push(e)
      map.set(pre.tStartMs, cc)
    }
  })

  console.log('map:', map)

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
  return events
}

let getResult = function (response, map) {
  let resJson = JSON.parse(response.text)
  // console.log('-------------------')
  // console.log(resJson)
  // console.log('-------------------')

  // 英文 segs array 文字接在一起
  console.log('org subtitle:', resJson.events)
  resJson.events = processEvents(resJson.events)

  console.log('subtitle:', resJson.events)

  // 將中英文加再一起
  let events = []
  resJson.events.forEach(function (event) {
    delete event.wWinId
    if (
      !(event.segs && event.segs.length === 1 && event.segs[0].utf8 === '\n')
    ) {
      if (event && event.segs) {
        event.segs = mergerSegs(event.segs, event, map)
      }
      events.push(event)
    }
  })
  resJson.events = events
  return JSON.stringify(resJson)
}

xhook.after(function (request, response) {
  let url = request.url

  // console.log('url:', url)
  if (url.includes('/api/timedtext')) {
    const params = new URLSearchParams(url)
    let lang = (params.get('lang') || '').toLocaleLowerCase()
    let tlang = (params.get('tlang') || '').toLocaleLowerCase()

    // lang 原語言, tlang 翻譯語言
    // console.log('lang:', lang, 'tlang:', tlang)

    // Robert(2023/10/30) : support original language, not only english
    if (lang != '' && tlang === '') {
      // console.log(
      //   'response.text:',
      //   typeof response.text,
      //   JSON.parse(response.text)
      // )

      response.text = linkSubtitlePart(response)
      // console.log('response.text2:', JSON.parse(response.text))

      // notice after ad...
      window.postMessage(
        { type: 'FROM_INJECTED', message: 'update subtitle!' },
        '*'
      )
    }
  }
})

let linkSubtitlePart = function (response) {
  let resJson = JSON.parse(response.text)
  resJson.events = processEvents(resJson.events)
  return JSON.stringify(resJson)
}
