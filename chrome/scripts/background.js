let storage = {};

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
	if (request.current) {
		return sendResponse({ current: storage.sound });
	}

	chrome.storage.sync.set({
		sound: request.sound
	});

	return sendResponse({ success: request.sound });
});

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create({ url: "https://vkzvuk.ru/app/" });
});

chrome.webRequest.onBeforeRequest.addListener((details) => {
	if (details.url.match("/bb1.mp3")) {
		return { redirectUrl: "https://vkzvuk.ru/sounds/" + storage.sound + ".mp3" };
	}

	if (details.url.match("/bb2.mp3")) {
		return { redirectUrl: "https://vkzvuk.ru/sounds/" + storage.sound + ".mp3" };
	}

	if (details.url.match("/bb3.mp3")) {
		return { redirectUrl: "https://vkzvuk.ru/sounds/" + storage.sound + ".mp3" };
	}
}, { urls: ["*://*.vk.me/*", "*://*.vk.com/*"] }, ["blocking"]);

chrome.storage.sync.get({sound: "5655655-1"}, (updated) => {
	storage = updated;
});

chrome.storage.onChanged.addListener(() => {
	chrome.storage.sync.get({sound: "5655655-1"}, (updated) => {
		storage = updated;

		chrome.tabs.query({ url: "*://*.vk.com/*" }, (tabs) => {
			for (let i = 0; i < tabs.length; i++) {
				chrome.tabs.reload(tabs[i].id);
			}
		});
	});
});