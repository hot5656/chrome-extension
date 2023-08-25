chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({
    shows: [],
  });

  // console.log(details);
  chrome.contextMenus.create({
    title: "Search TV Show",
    id: "contextMenu1",
    contexts: ["page", "selection"],
  });

  chrome.contextMenus.create({
    title: "Read This Text",
    id: "contextMenu2",
    contexts: ["page", "selection"],
  });

  // call 3rd party API
  chrome.contextMenus.onClicked.addListener((event) => {
    if (event.menuItemId === "contextMenu1") {
      // console.log("contextMenus-Search TV Show");
      fetch(`https://api.tvmaze.com/search/shows?q=${event.selectionText}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          chrome.storage.local.set({
            shows: data,
          });
        });
    } else if (event.menuItemId === "contextMenu2") {
      // console.log("Read This Text");
      chrome.tts.speak(event.selectionText, {
        // support auto detect
        // lang: "zh",
        rate: 2,
      });
    }
  });

  // search
  // chrome.contextMenus.onClicked.addListener((event) => {
  //   console.log(event);
  //   // google search
  //   // chrome.search.query({
  //   //   disposition: "NEW_TAB",
  //   //   // imdb TV show
  //   //   text: `imdb ${event.selectionText}`,
  //   // });

  //   // check open website
  //   // chrome.tabs.query(
  //   //   {
  //   //     currentWindow: true,
  //   //   },
  //   //   (tabs) => {
  //   //     console.log(tabs);
  //   //   }
  //   // );

  //   // create window
  //   chrome.tabs.create({
  //     url: `https://www.imdb.com/find/?q=${event.selectionText}&ref_=nv_sr_sm`,
  //   });
  // });

  // children menu
  // chrome.contextMenus.create({
  //   title: "Test Context Menu 1",
  //   id: "contextMenu1-1",
  //   parentId: "contextMenu1",
  //   contexts: ["page", "selection"],
  // });
  // chrome.contextMenus.create({
  //   title: "Test Context Menu 2",
  //   id: "contextMenu1-2",
  //   parentId: "contextMenu1",
  //   contexts: ["page", "selection"],
  // });
});

// console.log("background script running");

// receive message from content
// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log("msg(background):", msg);
//   console.log("sender(background):", sender);
//   // console.log("sendResponse:", sendResponse);
//   sendResponse("receive message from background");

//   chrome.tabs.sendMessage(sender.tab.id, "Got your message from background!");
// });
