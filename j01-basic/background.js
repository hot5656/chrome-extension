// console.log("Hello from the background script!");
// console.log(this);

// let time = 0;
//
// setInterval(() => {
//   time += 1;
//   console.log(time);
// }, 1000);

chrome.alarms.create({
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  // console.log(alarm);

  chrome.storage.local.get(["timer"], (res) => {
    const time = res.timer ?? 0;
    chrome.storage.local.set({
      timer: time + 1,
    });

    chrome.action.setBadgeText({
      text: `${time + 1}`,
    });

    if (time % 10 == 0) {
      this.registration.showNotification("Chrome Timer Extension", {
        body: "10 senconds has passed!",
        icon: "icon.png",
      });
    }
  });
});
