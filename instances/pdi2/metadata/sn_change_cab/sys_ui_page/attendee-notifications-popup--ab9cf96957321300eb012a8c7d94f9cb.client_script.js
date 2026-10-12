function sendToNew() {
	var gdw = GlideDialogWindow.get();
	var f = gdw.getPreference('sendToNew');
	if (typeof(f) == 'function') {
		f();
		return;
	}
}

function sendToAll() {
	var gdw = GlideDialogWindow.get();
	var f = gdw.getPreference('sendToAll');
	if (typeof(f) == 'function') {
		f();
		return;
	}
}
