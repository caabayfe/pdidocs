function onSubmit() {
    var gwt = new GwtMessage();
    g_form.hideFieldMsg('retention_days', true);

    if (g_form.getIntValue('retention_days') > 0) {
        return;
    }
    var msg = gwt.getMessage("Only integer values greater than 0 are permissible");
    g_form.showFieldMsg('retention_days', msg, 'error', true);
	
    return false;
}
