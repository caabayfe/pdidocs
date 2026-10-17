(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.includeInSystem = current.getDisplayValue('default');
	g_scratchpad.cleanup_script_error_handling_warning = sn_i18n.Message.getMessage('sn_instance_clone','cleanup_script_error_handling_warning');
	g_scratchpad.cleanup_script_active_info = sn_i18n.Message.getMessage('sn_instance_clone','cleanup_script_active_info');
	g_scratchpad.cleanup_script_order_info = sn_i18n.Message.getMessage('sn_instance_clone','cleanup_script_order_info');
})(current, previous);
