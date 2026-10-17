function onLoad() {
	if (g_scratchpad.remote_base_update_set == "") {
		return;
	}

	var state = g_form.getValue("state");
	if (state != "committed")
		g_form.addWarningMessage(getMessage('warn_user_of_updateset_custom_table_impact'));
	if (state == "in_hierarchy" || state == "previewed_in_hierarchy" && g_scratchpad.remote_base_update_set != g_form.getUniqueValue())
		g_form.addInfoMessage(
			formatMessage(getMessage('This update set is part of a batch. To preview or commit it, use the batch base: <a href="sys_remote_update_set.do?sys_id={0}">{1}</a>.'), g_scratchpad.remote_base_update_set, g_scratchpad.remote_base_update_set_name));
   
}
