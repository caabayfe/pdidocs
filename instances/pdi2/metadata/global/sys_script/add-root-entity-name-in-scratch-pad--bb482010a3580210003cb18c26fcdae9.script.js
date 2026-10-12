(function executeRule(current, previous /*null when async*/) {

	var grEntity = new GlideRecord("promin_project_entity");
	grEntity.addQuery("project", current.project);
	grEntity.addNullQuery("parent_entity");
	grEntity.query();
	if(grEntity.next()){
		g_scratchpad.rootEntity = grEntity.table;
	}

})(current, previous);
