function orderItems() {
	var gdw = GlideDialogWindow.get();
	var f = gdw.getPreference('orderAgendaItems');
	if (typeof(f) == 'function') {
		f();
		return;
	}
}
