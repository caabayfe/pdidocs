(function executeRule(current, previous /*null when async*/) {

	if (current.source == "url")
		current.display_name = current.url;
	else
		current.display_name = current.sys_ui_script.getDisplayValue();

})(current, previous);
