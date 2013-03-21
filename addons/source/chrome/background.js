// Copyright (c) 2012 Anton Lukin
// Don't use this extension without active link to vkzvuk.ru, please

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    if(info.url.indexOf("notifier.js") + 1){
		return { redirectUrl: 'https://assets.vkzvuk.ru/notifier.js' }
	}
	
  },
  {urls: ["*://*.vk.me/*", "*://*.vk.com/*"], types: ["script"]},
  ["blocking"]
);