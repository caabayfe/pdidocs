(function executeRule(current, previous /*null when async*/) {

	// As per PRB1601232, creating os choices in different domain
	// can cause global values to not be available as options for this field
	// All options should be available as global
	current.sys_domain = "global";
	
})(current, previous);
