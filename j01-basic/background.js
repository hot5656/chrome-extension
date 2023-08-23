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

  chrome.storage.local.get(["timer", "isRunning"], (res) => {
    // console.log("background");

    const time = res.timer ?? 0;
    const isRunning = res.isRunning ?? true;

    if (!isRunning) {
      return;
    }

    chrome.storage.local.set({
      timer: time + 1,
    });

    chrome.action.setBadgeText({
      text: `${time + 1}`,
    });

    chrome.storage.sync.get("notificationTime", (res) => {
      const notificationTime = res.notificationTime ?? 10000;
      if (time % notificationTime == 0) {
        this.registration.showNotification("Chrome Timer Extension", {
          body: `${notificationTime} senconds has passed! (time = ${time})`,
          icon: "icon.png",
        });
        // console.log("tick", notificationTime, time);
      }
    });

    // if (time % 100 == 0) {
    //   this.registration.showNotification("Chrome Timer Extension", {
    //     body: "100 senconds has passed!",
    //     icon: "icon.png",
    //   });
    // }
  });
});
