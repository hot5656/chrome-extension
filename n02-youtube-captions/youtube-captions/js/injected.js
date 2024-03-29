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
  // send 同步
  let xhr = new XMLHttpRequest()
  xhr.open('GET', userLang ? userLang.baseUrl : `${url}&tlang=zh-Hans`, false)
  xhr.send()

  // 同步收資料, 存入 map
  let map = new Map()
  JSON.parse(xhr.response).events.forEach((event) => {
    // 若有 segs 則存於 map
    if (event.segs) {
      map.set(`${event.tStartMs}_${event.dDurationMs}`, mergerSegs(event.segs))
      // console.log(
      //   'map.set:',
      //   `${event.tStartMs}_${event.dDurationMs}`,
      //   mergerSegs(event.segs)
      // )
    }
  })
  return map
}

// 英文將 segs array 文字接在一起
const processEvents = function (events) {
  let map = new Map()
  let pre = null
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
  return events
}

let getResult = function (response, map) {
  let resJson = JSON.parse(response.text)
  // 英文 segs array 文字接在一起
  resJson.events = processEvents(resJson.events)

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

  if (url.includes('/api/timedtext')) {
    const zhReg = /^zh-\w+/
    const params = new URLSearchParams(url)
    let lang = (params.get('lang') || '').toLocaleLowerCase()
    let tlang = (params.get('tlang') || '').toLocaleLowerCase()

    // 若不含 zh-*, 才處理(加 zh-cn)
    // lang 原語言, tlang 翻譯語言
    // console.log('lang:', lang, 'tlang:', tlang)
    if (!zhReg.test(lang) && !zhReg.test(tlang)) {
      let map = setMap(undefined, url)
      response.text = getResult(response, map)
    }
  }
})
