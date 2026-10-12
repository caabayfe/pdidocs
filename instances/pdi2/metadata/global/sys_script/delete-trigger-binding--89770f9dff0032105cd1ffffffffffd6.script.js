(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var triggerBindingGR = new GlideRecord("sys_hub_trigger_binding");
	triggerBindingGR.addQuery("trigger_definition", current.getUniqueValue());
	triggerBindingGR.deleteMultiple();

})(current, previous);
