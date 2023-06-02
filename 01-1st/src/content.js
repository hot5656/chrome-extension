window.onload= () => {
	const button = document.createElement('button');
	button.id = "darkModeButton";
	button.textContent = "DO IT DARK"
	// document.querySelector("#end").prepend(button);
	// document.querySelector("#end").prepend("Dark mode");

	const input = document.createElement('input');
	input.type = "checkbox"
	input.id = "darkSetting"

	console.log('Bookmark ...1');

	document.querySelector("#end").prepend(button, input, 'Auto apply?');

	button.addEventListener('click', () => enableDarkMode());
	input.addEventListener('click', () => storeSetting())
	checkSetting();
}

function enableDarkMode() {
	document.getElementsByTagName("ytd-app")[0].style.backgroundColor = "black";
}

function storeSetting() {
	const isEnable = document.getElementById('darkSetting').checked;
	const setting = {enabled: isEnable};

	chrome.storage.local.set(setting, () => {
		console.log('stored', setting);
	});
}

function checkSetting() {
	chrome.storage.local.get(['enabled'], (result) => {
		const isEnable = result.enabled
		console.log(isEnable);
		document.getElementById('darkSetting').checked = isEnable;

		if (isEnable) {
			enableDarkMode();
		}
	});
}