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
  // Robert(2023/10/12) : change from xhook to ajax-hook
  let resJson = JSON.parse(response)
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

// when all page load complete, add xhook
window.addEventListener('load', function () {
  console.log('load......')

  // Robert(2023/10/12) : change from xhook to ajax-hook
  ah.proxy({
    //請求發起前進入
    onRequest: (config, handler) => {
      if (config.url.includes('/api/timedtext')) {
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
      if (response.config.url.includes('/api/timedtext')) {
        const params = new URLSearchParams(response.config.url)
        let lang = (params.get('lang') || '').toLocaleLowerCase()
        let tlang = (params.get('tlang') || '').toLocaleLowerCase()

        // lang 原語言, tlang 翻譯語言
        console.log('lang:', lang, 'tlang:', tlang)
        if (lang === 'en' && tlang === '') {
          let map = setMap(undefined, response.config.url)
          response.response = getResult(response.response, map)
        }
      }
      handler.next(response)
    },
  })
})
