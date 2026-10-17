(function test(params) {
	var versionRecord = new GlideRecordSecure('promin_model_def_version');
	if (!versionRecord.get(params.versionId))
		return false;
	
	var projectId = versionRecord.getValue('project');
	
	var entityRecord = new GlideRecordSecure("promin_project_entity");
	entityRecord.addQuery("project", projectId);
	entityRecord.addNullQuery("parent_entity");
	entityRecord.query();
	
	if (!entityRecord.hasNext())
		return false;
	
	entityRecord.next();
	var entityTable = entityRecord.getValue("table");
	return entityTable == 'incident';
})(inputProperties);
