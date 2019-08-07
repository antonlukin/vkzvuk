function save_options() {
	var sound = document.getElementById('options-sound').value;

	chrome.storage.sync.set({sound: sound}, function() {
		var status = document.getElementById('status');

		status.textContent = 'Сохранено';
		setTimeout(function() {
			status.textContent = '';
		}, 2000);
	});
}

function restore_options() {
	chrome.storage.sync.get({sound: ''}, function(options) {
		document.getElementById('options-sound').value = options.sound;
	});
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
