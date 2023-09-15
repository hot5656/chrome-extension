chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = details.url
    const filters = ['gooleadserves', 'googlesyndication', 'g.doubleclick']
    for (const filter of filters) {
      if (url.indexOf(filter) != -1) {
        // print ==> https://securepubads.g.doubleclick.net/tag/js/gpt.js
        console.log(url)
        return {
          cancel: true,
        }
      }
    }

    return {
      cancel: false,
    }
    // console.log('details:', details)
    // set block
    // return {
    //   cancel: true,
    // }
  },
  {
    // block all
    urls: ['<all_urls>'],
    // no block
    // urls: [''],
    // define block
    // urls: [
    //   '<all_urls>',
    //   '*://*.gooleadserves.com/*',
    //   '*://*.tpc.googlesyndication.com/*',
    //   '*://googleads.g.doubleclick.net/*',
    //   '*://tpc.googlesyndication.com/*',
    // ],
  },
  ['blocking']
)
