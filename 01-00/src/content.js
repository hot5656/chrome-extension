window.onload = () => {
	const button = document.createElement('button');
	button.id = 'darkModeButton';
	// button.textContent = "DO IT DACK";
	button.textContent =  chrome.i18n.getMessage("enableDarkModeText");

	const input = document.createElement('input');
	input.type = 'checkbox';
	input.id = 'darkSetting'

	// add button ,若使用 #buttons 最後不能顯示,可能是原程式蓋掉加入之button
	// document.querySelector("#buttons").prepend(button);
	document.querySelector("#end").prepend(button, input, 'Auto apply?');
	button.addEventListener('click', () => {
		chrome.storage.local.get(['enabled'], (result) => {
			const isEnable = !result.enabled;
			document.getElementById('darkSetting').checked = isEnable;
			storeSetting();
		})

		enableDarkMode(true)
	});

	// save dark mode to chrome storage
	input.addEventListener('click', () => storeSetting())

	// save dark mode to chrome storage
	checkSetting();
}

// save dark mode to chrome storage
function checkSetting() {
	chrome.storage.local.get(['enabled', 'color'], (result) => {
		const isEnable = result.enabled
		// console.log(isEnable)
		// console.log(result.color)

		document.getElementById('darkSetting').checked = isEnable;
		if (isEnable) {
			enableDarkMode(true);
		}
	})
}

// save dark mode to chrome storage
function storeSetting() {
	const isEnabled = document.getElementById('darkSetting').checked;
	const setting = { enabled: isEnabled, color:'purple'} ;

	chrome.storage.local.set(setting, () => {
		// console.log('store', setting);
		;
	})
	enableDarkMode(isEnabled);
}

function enableDarkMode(flag) {
	if (flag) {
		document.getElementsByTagName('ytd-app')[0].style.backgroundColor= 'black';
	}
	else {
		document.getElementsByTagName('ytd-app')[0].style.backgroundColor= '';
	}
}

