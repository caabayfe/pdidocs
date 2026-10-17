(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var attribute = current.security_attribute;
	if (current.local_or_existing == 'Existing' || !attribute)
		return;

	var gr = new GlideRecord('sys_security_attribute');
	var exists = gr.get(attribute);
	if (!exists)
		return;

	gr.deleteRecord();
})(current, previous);
