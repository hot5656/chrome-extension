// console.log("Hello from the content script!");

// confirm("Hello from the content script!");
// const aTags = document.getElementsByTagName("a");
// for (const tag of aTags) {
//   // tag.textContent = "Hello world!";
//   if (tag.textContent.includes("i")) {
//     tag.style = "background-color: yellow;";
//   }
// }

const text = [];
const aTags = document.getElementsByTagName("a");
for (const tag of aTags) {
  text.push(tag.textContent);
}

chrome.storage.local.set({
  text,
});

// send message to background
// chrome.runtime.sendMessage(null, text, (response) => {
//   console.log("I'm from the send response function:" + response);
// });

// receive message from background
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("message(content):" + message);
//   console.log("sender(content):", sender);
// });
