var fieldsToClear = [
	'hide_list_actions',
	'hide_title',
	'hide_record_count_badge',
	'hide_refresh_button',
	'hide_last_refreshed_text',
	'hide_menu_button',
	'hide_option_to_save_as',
	'hide_sharing_button',
	'hide_panel_button',
	'hide_panel_footer',
	'hide_panel_restore',
	'hide_panel_advanced',
	'hide_panel_condition_delete',
	'show_filter_overview'
]

function onCondition() {
	fieldsToClear.forEach(function (fieldName) {
		// show_filter_overview's default value is true
		// skip over show_filter_overview to ensure default/modified value persists
		// and change to readOnly
		if (fieldName != 'show_filter_overview') {
			g_form.clearValue(fieldName);
		}
		g_form.setReadOnly(fieldName, true);
	});
}
