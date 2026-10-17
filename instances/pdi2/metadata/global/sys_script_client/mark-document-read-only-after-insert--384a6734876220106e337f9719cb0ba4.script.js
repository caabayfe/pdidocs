function onLoad() {
	if (!g_form.isNewRecord()) {
		g_form.setReadOnly('document',true);
		g_form.setReadOnly('type',true);
	}
   
}
