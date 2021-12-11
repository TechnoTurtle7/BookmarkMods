function renameTab() {
	document.title = prompt("Target Title:");
	document.onclose = function() {
		window.open();
	}
}