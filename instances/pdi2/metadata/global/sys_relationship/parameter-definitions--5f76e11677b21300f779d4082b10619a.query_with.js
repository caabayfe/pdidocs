(function refineQuery(current, parent) {
	var test_id = parent.sys_id;
	var queryStr = "name=sys_atf_parameter_set^ORname=var__m_sys_atf_parameter_variable_" + test_id + "^element!=active^element!=description^element!=order^element!=parameters^element!=sys_id^element!=test^element!=copied_from";
	current.addEncodedQuery(queryStr);
	current.query();
})(current, parent);
