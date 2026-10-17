function onLoad() {
	// If the change task is saved, the change request field become read-only
	if(!g_form.isNewRecord())
		g_form.setReadOnly('change_request', true);
}
