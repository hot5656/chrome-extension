// console.log("Hello from the options page!");

const nameInput = document.getElementById("name-input");
const saveBtn = document.getElementById("save-btn");

saveBtn.addEventListener("click", () => {
  // console.log(nameInput.value);

  const name = nameInput.value;
  chrome.storage.sync.set(
    {
      // name: name
      name,
    },
    () => {
      console.log(`Name is set to ${name}`);
    }
  );
});

chrome.storage.sync.get(["name"], (res) => {
  // console.log(res);

  // if undefine or null return string
  nameInput.value = res.name ?? "";
});
