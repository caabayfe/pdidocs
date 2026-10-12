(function executeRule(current, previous /*null when async*/) {

	// update default value in sys_application_property to stay in sync with it
	var applicationProperty = new GlideRecord('sys_application_property');
	applicationProperty.get(current.sys_application_property);
	applicationProperty.default_value = current.value;
	applicationProperty.setWorkflow(false); // prevent looping
	applicationProperty.update();

})(current, previous);
