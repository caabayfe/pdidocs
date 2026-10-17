function onBefore(current, previous) {
	var serviceName = current.name;

	var op = current.operation();
	if (op == 'update' && current.name == previous.name)  //Fix for PRB656010
		return;

	var gr = new GlideRecord('cmdb_ci_service_auto');
	// Service groups have business rules of their own
	if (current.sys_class_name == 'cmdb_ci_service_group')
		return;

	// Empty name is not checked
	if (current.name == '' || current.name == null)
		return;

	gr.addQuery('name', serviceName );
	// PRB674930: we allow having service and service group with the same name
	gr.addQuery('sys_class_name', '!=', 'cmdb_ci_service_group');
	gr.query();
	if (gr.next()) {
		if (gr.getValue("sys_id") != current.sys_id) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Business service {0} already exists. Please enter a different name.", serviceName));
		}
	}
}
