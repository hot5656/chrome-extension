const url_subtitle = 'vtt-c.udemycdn.com'
let mm = []

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
const setMap = function (response) {
  let map = []

  // map.push('abc')
  // map.push('def')
  // return map

  // map.push('2nd')
  const lines = response.split('\n')
  let i = 1
  let newItem = false

  lines.forEach((element, index) => {
    let newWords = ''
    if (newItem) {
      let xhr = new XMLHttpRequest()
      xhr.open(
        'GET',
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hans&dt=t&q=${element}`, // Replace with the URL of the JSON data
        false
      )
      xhr.send()

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText)
        // // newWords = data[0][0][0]
        // // map.push(newWords)
        // console.log(typeof xhr.responseText)
        // let dd = xhr.responseText.json()

        // console.log(data)
        newWords = data[0][0][0]
        map.push(newWords)
      } else {
        throw new Error('Network response was not ok')
      }

      // const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hans&dt=t&q=${element}` // Replace with the URL of the JSON data
      // fetch(url)
      //   .then((response) => {
      //     if (!response.ok) {
      //       throw new Error('Network response was not ok')
      //     }
      //     return response.json() // Parse the JSON response
      //   })
      //   .then((data) => {
      //     // Use the JSON data in your code
      //     // console.log(data[0][0][0], data)
      //     // console.log('data:', data[0][0])
      //     newWords = data[0][0][0]
      //     // console.log('data[0][0][0]', typeof data[0][0][0] === 'string')
      //     // console.log('data', typeof data)
      //     map.push(newWords)
      //   })
      //   .catch((error) => {
      //     console.error('Error:', error)
      //   })

      // lines[index] = element + '\n' + newWords
      // element = element + '\n' + element
    }
    // console.log(`${i} <${element}>`)
    if (element.includes('-->')) {
      newItem = true
    } else {
      newItem = false
    }
  })

  // let language_code = 'zh-Hans'

  // // get language
  // try {
  //   const languageDiv = document.getElementById('language-show')
  //   language_code = languageDiv.getAttribute('data-language')
  //   // console.log('   data-language:', language_code)
  // } catch (e) {
  //   console.log('event:', e)
  //   console.log('   data-language: not found')
  // }

  // // send 同步
  // let xhr = new XMLHttpRequest()
  // xhr.open(
  //   'GET',
  //   userLang ? userLang.baseUrl : `${url}&tlang=${language_code}`,
  //   false
  // )
  // xhr.send()

  // // 同步收資料, 存入 map
  // let map = new Map()

  // // some time receive html response, not parse
  // const isHtmlString = xhr.response.includes('<html>')
  // // console.log('xhr.response.includes("<html>" :', isHtmlString)
  // if (!isHtmlString) {
  //   JSON.parse(xhr.response).events.forEach((event) => {
  //     // 若有 segs 則存於 map
  //     if (event.segs) {
  //       map.set(
  //         `${event.tStartMs}_${event.dDurationMs}`,
  //         mergerSegs(event.segs)
  //       )
  //       // console.log(
  //       //   'map.set:',
  //       //   `${event.tStartMs}_${event.dDurationMs}`,
  //       //   mergerSegs(event.segs)
  //       // )
  //     }
  //   })
  // }
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

let getResult = function (maping, response) {
  // let resJson = JSON.parse(response)
  // 英文 segs array 文字接在一起
  // resJson.events = processEvents(resJson.events)

  // console.log('-------------------')
  // console.log(resJson)
  // console.log('-------------------')

  const lines = response.split('\n')
  let i = 0
  let newItem = false

  // console.log(maping)
  // console.log(typeof maping)
  // console.log(typeof maping[0])
  // console.log('map[0]:', maping[0])
  // console.log('map[1]:', maping[1])
  // console.log('map[2]:', maping[2])
  // return response

  lines.forEach((element, index) => {
    // let newWords = ''

    if (newItem) {
      lines[index] = maping[i] + '\n' + element
      // console.log(`${i} <${maping[i]}+'\n'${element}>`)
      i = i + 1

      // const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hans&dt=t&q=${element}` // Replace with the URL of the JSON data
      // fetch(url)
      //   .then((response) => {
      //     if (!response.ok) {
      //       throw new Error('Network response was not ok')
      //     }
      //     return response.json() // Parse the JSON response
      //   })
      //   .then((data) => {
      //     // Use the JSON data in your code
      //     // console.log(data[0][0][0], data)
      //     newWords = data[0][0][0]
      //   })
      //   .catch((error) => {
      //     console.error('Error:', error)
      //   })

      // element = element + '\n' + element
    }
    // console.log(`${i} <${element}>`)
    if (element.includes('-->')) {
      newItem = true
      if (i % 10 == 0) {
        console.log(element + '\n')
      }
    } else {
      newItem = false
    }
  })

  // console.log(lines)
  // console.log(lines.join('\n'))

  // const url =
  //   'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hans&dt=t&q=book' // Replace with the URL of the JSON data

  // console.log('=============================')

  // fetch(url)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error('Network response was not ok')
  //     }
  //     return response.json() // Parse the JSON response
  //   })
  //   .then((data) => {
  //     // Use the JSON data in your code
  //     console.log(data[0][0][0], data)
  //   })
  //   .catch((error) => {
  //     console.error('Error:', error)
  //   })

  // lines.forEach((element) => {
  //   console.log(`${i} <${element}>`)
  //   i = i + 1
  // })

  response = lines.join('\n')

  // console.log(response)
  return response
  // 將中英文加再一起
  // let events = []
  // resJson.events.forEach(function (event) {
  //   delete event.wWinId
  //   if (
  //     !(event.segs && event.segs.length === 1 && event.segs[0].utf8 === '\n')
  //   ) {
  //     if (event && event.segs) {
  //       event.segs = mergerSegs(event.segs, event, map)
  //     }
  //     events.push(event)
  //   }
  // })
  // resJson.events = events
  // return JSON.stringify(resJson)
}

// when all page load complete, add xhook
// window.addEventListener('load', function () {
//   // console.log('xhook.after...')
//   xhook.after(function (request, response) {
//     let url = request.url

//     if (url.includes('vtt-b.udemycdn.com')) {
//       console.log('url:', url)
//       // console.log('request:', request)
//       // console.log('response.text:', response.text)
//     }

//     // console.log('url:', url)
//     // if (url.includes('/api/timedtext')) {
//     //   const params = new URLSearchParams(url)
//     //   let lang = (params.get('lang') || '').toLocaleLowerCase()
//     //   let tlang = (params.get('tlang') || '').toLocaleLowerCase()

//     //   // lang 原語言, tlang 翻譯語言
//     //   // console.log('lang:', lang, 'tlang:', tlang)

//     //   if (lang === 'en' && tlang === '') {
//     //     let map = setMap(undefined, url)
//     //     response.text = getResult(response, map)
//     //   }
//     // }
//   })
// })

// when all page load complete, add xhook
window.addEventListener('load', function () {
  console.log('load......')

  // ah.proxy({
  //   //請求發起前進入
  //   onRequest: (config, handler) => {
  //     console.log('url:', config.url)
  //     console.log(
  //       'config.url.includes(url_subtitle)',
  //       config.url.includes(url_subtitle),
  //       url_subtitle
  //     )

  //     if (config.url.includes(url_subtitle)) {
  //       console.log('--------------------------------------')
  //       console.log(config.url)
  //     }
  //     handler.next(config)
  //   },
  //   //請求發生錯誤時進入，例如超時；注意，不包括http狀態碼錯誤，如404仍然會認為請求成功
  //   onError: (err, handler) => {
  //     console.log(err.type)
  //     handler.next(err)
  //   },
  //   //請求成功後進入
  //   onResponse: (response, handler) => {
  //     // if (response.config.url.includes('vtt-b.udemycdn.com')) {
  //     //   const params = new URLSearchParams(response.config.url)
  //     //   let lang = (params.get('lang') || '').toLocaleLowerCase()
  //     //   let tlang = (params.get('tlang') || '').toLocaleLowerCase()

  //     //   // lang 原語言, tlang 翻譯語言
  //     //   console.log('lang:', lang, 'tlang:', tlang)
  //     //   if (lang === 'en' && tlang === '') {
  //     //     let map = setMap(undefined, response.config.url)
  //     //     response.response = getResult(response.response, map)
  //     //   }
  //     // }

  //     if (response.config.url.includes(url_subtitle)) {
  //       console.log(response.response)
  //     }
  //     handler.next(response)
  //   },
  // })

  // ah.proxy({
  //   //请求发起前进入
  //   onRequest: (config, handler) => {
  //     console.log(config.url)
  //     handler.next(config)
  //   },
  //   //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
  //   onError: (err, handler) => {
  //     console.log(err.type)
  //     handler.next(err)
  //   },
  //   //请求成功后进入
  //   onResponse: (response, handler) => {
  //     console.log(response.response)
  //     handler.next(response)
  //   },
  // })
})

ah.proxy({
  //請求發起前進入
  onRequest: (config, handler) => {
    // console.log('url:', config.url)
    // console.log(
    //   'config.url.includes(url_subtitle)',
    //   config.url.includes(url_subtitle),
    //   url_subtitle
    // )

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
    // if (response.config.url.includes('vtt-b.udemycdn.com')) {
    //   const params = new URLSearchParams(response.config.url)
    //   let lang = (params.get('lang') || '').toLocaleLowerCase()
    //   let tlang = (params.get('tlang') || '').toLocaleLowerCase()

    //   // lang 原語言, tlang 翻譯語言
    //   console.log('lang:', lang, 'tlang:', tlang)
    //   if (lang === 'en' && tlang === '') {
    //     let map = setMap(undefined, response.config.url)
    //     response.response = getResult(response.response, map)
    //   }
    // }

    if (response.config.url.includes(url_subtitle)) {
      let maping = setMap(response.response)
      mm = maping
      // console.log(maping)
      // console.log('maping[0]:', maping[0])
      // console.log('maping[1]:', maping[1])
      // console.log('maping[2]:', maping[2])
      // console.log(response.response)
      // getResult(maping, response.response)
      // console.log(getResult(maping, response.response))
      response.response = getResult(maping, response.response)
      // console.log(response.response)
    }
    handler.next(response)
  },
})

async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error // Rethrow the error if needed
  }
}
