function onLoad() {
	if (g_form.getValue("trigger_type") !== "d249fae6ff3f12108f25ffffffffff89") return;
	
	var field = "trigger_inputs.var__m_sys_pd_trigger_input_d249fae6ff3f12108f25ffffffffff89.limit";
	if (g_form.getIntValue(field) > g_scratchpad.maxQueryLimit) {
		var msg = getMessage("Value not supported; select a value less than or equal to {0} to continue.").replace("{0}", g_scratchpad.maxQueryLimit);
		g_form.showErrorBox(field, msg, 'error');
	}
}
