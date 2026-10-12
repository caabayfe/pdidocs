(function executeRule(current, previous /*null when async*/ ) {

    var grEntity = new GlideRecord("promin_project_entity");
    grEntity.addQuery("project", current.getValue("project"));
    grEntity.addQuery("parent_entity", current.getUniqueValue());
	grEntity.addQuery("sys_id", "!=", current.getUniqueValue());
    grEntity.query();
    while (grEntity.next()) {
        grEntity.relation_type = '';
        grEntity.source_field = '';
		grEntity.target_field = '';
        grEntity.parent_entity = '';
		grEntity.setWorkflow(false);
        grEntity.update();
    }

})(current, previous);
