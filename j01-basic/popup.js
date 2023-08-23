const timeElement = document.getElementById("time");
const nameElement = document.getElementById("name");
const timerElement = document.getElementById("timer");

function updateTimeElement() {
  // console.log("popup");

  const currentTime = new Date().toLocaleTimeString();
  timeElement.textContent = `The Time is: ${currentTime}`;

  chrome.storage.local.get(["timer"], (resp) => {
    const time = resp.timer ?? 0;
    timerElement.textContent = `The timer is at: ${time} seconds`;
  });
}

updateTimeElement();
setInterval(updateTimeElement, 1000);

// move to background.js
// chrome.action.setBadgeText(
//   {
//     text: "TIME",
//   },
//   () => {
//     console.log("Finished setting badge text.");
//   }
// );

chrome.storage.sync.get(["name"], (res) => {
  // if undefine or null return string
  const name = res.name ?? "???";
  nameElement.textContent = `Your name is: ${name}`;
});

// start, stop, reset
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");

startBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    isRunning: true,
  });
});

stopBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    isRunning: false,
  });
});

resetBtn.addEventListener("click", () => {
  chrome.storage.local.set({
    timer: 0,
    isRunning: false,
  });
});
