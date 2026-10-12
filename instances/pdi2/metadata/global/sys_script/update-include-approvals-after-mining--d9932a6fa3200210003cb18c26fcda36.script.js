(function executeRule(current, previous /*null when async*/ ) {

    var grProjectEntity = new GlideRecord("promin_project_entity");
    grProjectEntity.addQuery("project", current.getUniqueValue());
    grProjectEntity.addQuery("include_approvals", true);
    grProjectEntity.query();

    while (grProjectEntity.next()) {
        grProjectEntity.setValue("include_approvals", false);
		grProjectEntity.setWorkflow(false);
        grProjectEntity.update();
    }


})(current, previous);
