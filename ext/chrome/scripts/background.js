var App = {
	opts: {},

	vars: function() {
		chrome.storage.sync.get({sound: 'trell'}, function(s) {
			App.opts = s;
		});

		chrome.storage.onChanged.addListener(function(changes, namespace) {
			App.vars();
			App.reload();
		});
	},

	block: function() {
		chrome.webRequest.onBeforeRequest.addListener(function(details) {
			var sound = App.opts.sound;

			if(details.url.match("bb1.mp3"))
				return {redirectUrl: 'https://vkzvuk.ru/sounds/' + sound + '.mp3'};

			if(details.url.match("bb2.mp3"))
				return {redirectUrl: 'https://vkzvuk.ru/sounds/' + sound + '.mp3'};
		},
		{urls: ["*://*.vk.me/*", "*://*.vk.com/*"]},
		["blocking"]);
	},

	reload: function() {
		chrome.tabs.query({url: "*://*.vk.com/*"}, function(tabs) {
			for (var i = 0; i < tabs.length; i++) {
				chrome.tabs.reload(tabs[i].id);
			}
		});
	},

	request: function() {
		chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
			if(request.current)
				return sendResponse({current: App.opts.sound});

			chrome.storage.sync.set({sound: request.sound});

			return sendResponse({success: request.sound});
		});
	},

	icon: function() {
		chrome.browserAction.onClicked.addListener(function(tab) {
			chrome.tabs.create({url: "https://vkzvuk.ru/app/"});
		})
	},

	init: function() {
		['vars', 'block', 'request', 'icon'].forEach(function(i, v) {
			App[i]();
		});
	}
}

App.init();
