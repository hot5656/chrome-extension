
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

// chrome.bookmarks.onMoved.addListener(() => {
// 	console.log('Bookmark moved')
// })
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log('message', message);
	console.log('sender',sender);
	sendResponse({ content: "background response" });
});


chrome.bookmarks.onMoved.addListener(() => {
	// send to active windows
	chrome.tabs.query({ active: true, currentWindow: true}, 
		tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {name: 'Robert'});
		}
	);
});
