(function executeRule(current, previous /*null when async*/ ) {

    var grProjectEntity = new GlideRecord("promin_project_entity");
    if (grProjectEntity.isValidField("include_approvals")) {
        grProjectEntity.addQuery("project", current.getUniqueValue());
        grProjectEntity.addQuery("include_approvals", true);
        grProjectEntity.query();
        if (grProjectEntity.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Since this project has included approvals checked on entity, new configuration has been added to the project by administrator to deprecate the current approval analysis process to enhance the feature. Please re-mine the project to view the process map."));
        }
    }

})(current, previous);
