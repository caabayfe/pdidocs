(function executeRule(current, previous /*null when async*/) {
	var grVersion = new GlideRecord('promin_model_def_version');
	grVersion.addQuery('project', current.getUniqueValue());
	grVersion.orderByDesc('sys_created_on');
	grVersion.setLimit(1);
	grVersion.query();
	if(grVersion.next()) {
		SNC.ProcessOptimization.executeAutoRunTasks(grVersion.getUniqueValue());
	}

})(current, previous);
