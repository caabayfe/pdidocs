function sendEmails() {
	var gdw = GlideDialogWindow.get();
	var f = gdw.getPreference('refreshAgendaItemsAndEmail');
	if (typeof(f) == 'function') {
		f();
		return;
	}
}

function dontSendEmails() {
	var gdw = GlideDialogWindow.get();
	var f = gdw.getPreference('refreshAgendaItems');
	if (typeof(f) == 'function') {
		f();
		return;
	}
}
