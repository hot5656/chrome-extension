const toggleBtn = document.getElementById('language_toggle')
toggleBtn.addEventListener('click', () => {
  chrome.storage.sync.get(['simpleChinese'], (res) => {
    console.log('get simpleChinese:', res.simpleChinese)

    chrome.storage.sync.set({
      simpleChinese: !res.simpleChinese,
    })

    console.log('set simpleChinese:', !res.simpleChinese)
    updateShowLanguage(!res.simpleChinese)
  })
})

function updateShowLanguage(isSimpleChinese) {
  const languageElement = document.getElementById('language')

  console.log('show simpleChinese:', isSimpleChinese)
  if (isSimpleChinese) {
    languageElement.textContent = '簡體中文'
  } else {
    languageElement.textContent = '繁體中文'
  }
}

// when open popup show
chrome.storage.sync.get(['simpleChinese'], (res) => {
  // if undefine or null return flase
  const isSimpleChinese = res.simpleChinese ?? flase
  updateShowLanguage(isSimpleChinese)
})
