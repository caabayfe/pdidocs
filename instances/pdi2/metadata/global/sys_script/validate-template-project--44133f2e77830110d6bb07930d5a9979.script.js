(function executeRule(current, previous /*null when async*/ ) {

    var rootEntityTables = [];

    var grEntity = new GlideRecord('promin_project_entity');
    grEntity.addQuery('project', current.getUniqueValue());
    grEntity.addNullQuery('parent_entity');
    grEntity.query();
    while (grEntity.next()) {
        rootEntityTables.push(grEntity.getValue('table'));
    }
	if(rootEntityTables.length == 0) {
		return;
	}

    var grProjectEntity = new GlideRecord('promin_project_entity');
    grProjectEntity.addQuery('project', '!=', current.getUniqueValue());
    grProjectEntity.addQuery('table', 'IN', rootEntityTables.join(','));
    grProjectEntity.addQuery('project.is_template', true);
    grProjectEntity.addQuery('project.template_type', current.template_type);
    grProjectEntity.addNullQuery('parent_entity');
    grProjectEntity.setLimit(1);
    grProjectEntity.query();

    if (grProjectEntity.next()) {
        var link = '<a href="' + grProjectEntity.project.getRefRecord().getLink() + '" target="_blank">Click here</a>';
        var error_message = gs.getMessage("Only one template is allowed per one parent table configuration. Please {0} to view existing template.", link);
        gs.addErrorMessage(error_message);
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }

})(current, previous);
