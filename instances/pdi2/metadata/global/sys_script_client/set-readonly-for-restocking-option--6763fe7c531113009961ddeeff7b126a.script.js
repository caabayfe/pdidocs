function onLoad() {
	if (!g_scratchpad.isPluginActiveProcurement && (g_form.isNewRecord() || g_form.getValue('restocking_option') === 'stockroom')) {
		g_form.setValue('restocking_option', 'stockroom');
		g_form.setReadOnly('restocking_option', true);
		g_form.addInfoMessage(getMessage('Activate Procurement plugin to see Vendor in field Restocking option'));
	}
}
