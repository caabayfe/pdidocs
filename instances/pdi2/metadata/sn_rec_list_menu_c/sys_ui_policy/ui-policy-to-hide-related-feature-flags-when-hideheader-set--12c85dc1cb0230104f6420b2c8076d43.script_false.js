var fieldsToClear = [
	'hide_list_actions',
	'hide_refresh_button',
	'hide_title',
	'hide_record_count_badge',
	'hide_last_refreshed_text',
	'hide_sharing_button',
	'show_filter_overview'
]

function onCondition() {
	fieldsToClear.forEach(function (fieldName) {
		g_form.setReadOnly(fieldName, false);
	});
	
	var hideMenuButton = g_form.getValue('hide_menu_button') == 'true';
	g_form.setReadOnly('hide_menu_button', false);
	g_form.setReadOnly('hide_option_to_save_as', hideMenuButton);
	
	var hidePanelButton = g_form.getValue('hide_panel_button') == 'true';
	g_form.setReadOnly('hide_panel_button', false);
	if (hidePanelButton) {
		g_form.setReadOnly('hide_panel_footer', true);
		g_form.setReadOnly('hide_panel_restore', true);
		g_form.setReadOnly('hide_panel_advanced', true);
		g_form.setReadOnly('hide_panel_condition_delete', true);
	} else {
		g_form.setReadOnly('hide_panel_footer', false);
		g_form.setReadOnly('hide_panel_condition_delete', false);
		
		var hidePanelFooter = g_form.getValue('hide_panel_footer') == 'true';
		g_form.setReadOnly('hide_panel_restore', hidePanelFooter);
		g_form.setReadOnly('hide_panel_advanced', hidePanelFooter);
	}
}
