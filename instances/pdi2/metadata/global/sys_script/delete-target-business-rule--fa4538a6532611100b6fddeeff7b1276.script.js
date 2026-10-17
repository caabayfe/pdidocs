(function executeRule(current, previous /*null when async*/) {
	var brGr = new GlideRecord('sys_script');
	brGr.get(current.business_rule);
	brGr.deleteRecord();
})(current, previous);
