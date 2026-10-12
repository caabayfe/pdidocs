function onLoad() {
	if(g_scratchpad.is_custom_scope === false || g_form.getValue('basic_apply_to') === '')
	   g_form.hideRelatedList('sys_ui_related_list_relationship_entry');
}
