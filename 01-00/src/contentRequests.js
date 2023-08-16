// nee github api permission(manifest.json
// "host_permissions": ["https://api.github.com"],

const requestSender = new XMLHttpRequest()

requestSender.onreadystatechange = apiHandler;


// 0	UNSENT	客戶端已被建立，但 open() 方法尚未被呼叫。
// 1	OPENED	open() 方法已被呼叫。
// 2	HEADERS_RECEIVED	send() 方法已被呼叫，而且可取得 header 與狀態。
// 3	LOADING	回應資料下載中，此時 responseText 會擁有部分資料。
// 4	DONE	完成下載操作。
function apiHandler(response) {
	if (requestSender.readyState === 4  && requestSender.status === 200) {
		// console.log(response)
		console.log(response.target.response)
	}
}

// sync
// requestSender.open('GET', 'https://api.github.com/users/peter', true);
// requestSender.send();
//
// requestSender.open('GET', 'https://api.github.com/users/tomas', true);
// requestSender.send();
// --> response tomas

// async
requestSender.open('GET', 'https://api.github.com/users/peter', false);
requestSender.send();

requestSender.open('GET', 'https://api.github.com/users/tomas', false);
requestSender.send();
// --> response peter and tomas