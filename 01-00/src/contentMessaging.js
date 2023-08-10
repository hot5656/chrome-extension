// window.onload(alert('I loaded'));

// call window.onload twince ,show 2 "DO IT DARK" button
// window.onload(testMessage());
testMessage()

function testMessage() {
	chrome.runtime.sendMessage(
		{ payload: "Hellow from a content" }, 
		// backback function for receive side
		(response) => {
			// console.log(response);
			;
		}
	);
}

chrome.runtime.onMessage.addListener((message, sender) => {
	console.log('message', message);
	console.log('sender',sender);
});
