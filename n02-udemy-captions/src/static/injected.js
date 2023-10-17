const url_subtitle = 'vtt-c.udemycdn.com'

// sned http request, save data to map
const setMap = function (response) {
  let map = []
  const lines = response.split('\n')
  let i = 1
  let newItem = false

  lines.forEach((element, index) => {
    let newWords = ''
    if (newItem) {
      let xhr = new XMLHttpRequest()
      xhr.open(
        'GET',
        // `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hans&dt=t&q=${element}`,
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-Hant&dt=t&q=${element}`,
        false
      )
      xhr.send()

      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText)
        newWords = data[0][0][0]
        map.push(newWords)
      } else {
        throw new Error('Network response was not ok')
      }
    }

    if (element.includes('-->')) {
      newItem = true
    } else {
      newItem = false
    }
  })
  return map
}

let getResult = function (map, response) {
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
      if (i % 10 == 0) {
        console.log(element + '\n')
      }
    } else {
      newItem = false
    }
  })

  response = lines.join('\n')
  return response
}

// when all page load complete, add xhook
// window.addEventListener('load', function () {
//   console.log('load......')
// })

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
      let map = setMap(response.response)
      response.response = getResult(map, response.response)
    }
    handler.next(response)
  },
})
