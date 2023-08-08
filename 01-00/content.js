window.onload = () => {
	const button = document.createElement('button');
	button.id = 'darkModeButton';
	button.textContent = "DO IT DACK";
	// add button ,若使用 #buttons 最後不能顯示,可能是原程式蓋掉加入之button
	// document.querySelector("#buttons").prepend(button);
	document.querySelector("#end").prepend(button);
	button.addEventListener('click', () => enableDarkMode());
}

function enableDarkMode() {
	document.getElementsByTagName('ytd-app')[0].style.backgroundColor= 'black';
}