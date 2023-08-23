// console.log("Hello from the options page!");

const nameInput = document.getElementById("name-input");
const timeInput = document.getElementById("time-input");
const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", () => {
  // console.log(nameInput.value);

  const name = nameInput.value;
  const notificationTime = timeInput.value;
  chrome.storage.sync.set(
    {
      // name: name
      name,
      notificationTime,
    }
    // () => {
    //   console.log(`Name is set to ${name}`);
    // }
  );
});

chrome.storage.sync.get(["name", "notificationTime"], (res) => {
  // console.log(res);

  // if undefine or null return string
  nameInput.value = res.name ?? "";
  timeInput.value = res.notificationTime ?? 1000;
});

setInterval(() => {
  // console.log("options");
}, 1000);
