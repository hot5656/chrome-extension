const timeElement = document.getElementById("time");
const nameElement = document.getElementById("name");
const timerElement = document.getElementById("timer");

function updateTimeElement() {
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
