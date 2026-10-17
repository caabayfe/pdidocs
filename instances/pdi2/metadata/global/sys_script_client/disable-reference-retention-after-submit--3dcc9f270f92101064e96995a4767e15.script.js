function onLoad() {
	var retain = g_form.getBooleanValue("retain_references");
    if (!g_form.isNewRecord() && retain) {
        g_form.setReadOnly('retain_references', true);
    }
}
