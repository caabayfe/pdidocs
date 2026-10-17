function onDecide(which) {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dlg = dialogClass.prototype.get('confirm_reparent_dialog');
    var func = dlg.getPreference(which);
	if (typeof func == 'function') {
		try {
			return func.call(null);
		} catch(e) {
			return false;
		}
	}
		
    return true;
}
