(function executeRule(current, previous /*null when async*/) {
	
	var stepGr = new GlideRecord(current.getTableName());
	stepGr.addQuery("parent", current.getUniqueValue());
	stepGr.query();
	stepGr.deleteMultiple();

	var dependencyService = new SNHelpSetupDependencyService();

	var step = {
		sys_id : current.getUniqueValue(),
		order : current.order.toString(),
		parent : current.parent && current.parent.toString(),
		parentOrder : current.parent && current.parent.order.toString()
	};

	dependencyService.removeDependentStepsOnDelete(step);

	var dependencyGr = new GlideRecord("help_m2m_step_dependency");
	dependencyGr.addQuery("guidance_step", current.getUniqueValue());
	dependencyGr.query();
	while(dependencyGr.next()) {
		dependencyGr.setup_dependency.getRefRecord().deleteRecord();
		dependencyGr.deleteRecord();
	}

})(current, previous);
