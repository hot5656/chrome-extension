// remove ad by JavaScript
// set to "enabled": false,
//
// "declarative_net_request": {
// 	"rule_resources": [
// 		{
// 			"id": "ruleset_1",
// 			"enabled": false,
// 			"path": "rules_1.json"
// 		}
// 	]
// },

// 對特定網頁執行特定功能 %?%
const rules: {
  [url: string]: () => void
} = {
  'https://www.nytimes.com/section/opinion/editorials':
    filterNYTOpinionEeditorials2,
}

// block by id
function filterNYTOpinionEeditorials() {
  const app = document.getElementById('site-content')
  const wrapper = document.getElementById('top-wrapper')
  app.removeChild(wrapper)
}

// block by class
function filterNYTOpinionEeditorials2() {
  const divs = document.getElementsByTagName('div')
  for (const div of divs) {
    if (div.className.indexOf('ad') != -1) {
      div.style.display = 'none'
    }
  }
}

if (document.URL in rules) {
  console.log('document.URL:', document.URL)
  rules[document.URL]()
}
