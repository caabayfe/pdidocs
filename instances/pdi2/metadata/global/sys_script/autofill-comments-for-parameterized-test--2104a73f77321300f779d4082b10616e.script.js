(function executeRule(current, previous /*null when async*/) {
	if (current.name == "sys_atf_parameter_set")
		current.comments = "Shared Parameter";
	if(current.name.indexOf("var__m_sys_atf_parameter_variable_") == 0)
		current.comments = "Exclusive Parameter";
})(current, previous);
