import * as message from "./backgroundMessaging.js"


chrome.runtime.onInstalled.addListener((tab) => {
	console.log(tab)
	console.log('Extension installed')
})

chrome.bookmarks.onCreated.addListener(() => {
	console.log('Bookmark saved')
})

// 不需要有此 function
// chrome.action.onClicked.addListener( () => {
// 	console.log('chrome action click')
// })

