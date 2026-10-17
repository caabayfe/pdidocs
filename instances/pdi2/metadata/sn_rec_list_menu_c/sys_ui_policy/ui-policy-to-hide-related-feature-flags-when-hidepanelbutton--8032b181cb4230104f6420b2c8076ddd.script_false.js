function onCondition() {
	g_form.setReadOnly('hide_panel_footer', false);
	g_form.setReadOnly('hide_panel_condition_delete', false);
	
	var hidePanelFooter = g_form.getValue('hide_panel_footer') == 'true';
	g_form.setReadOnly('hide_panel_restore', hidePanelFooter);
	g_form.setReadOnly('hide_panel_advanced', hidePanelFooter);
}
