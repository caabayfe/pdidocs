(function executeRule(current, previous /*null when async*/) {

	var triggerBindingGR = new GlideRecord("sys_hub_trigger_binding");
	triggerBindingGR.addQuery("identifier", current.getUniqueValue());
	triggerBindingGR.deleteMultiple();

})(current, previous);
