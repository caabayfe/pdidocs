(function executeRule(current, previous /*null when async*/) {
	if(current.operation() == "delete" || current.name.changes() || current.type.changes() || current.roles.changes() || current.app_route.changes() || 
current.version.changes() || current.eh_content.changes() || current.context.changes() || current. description.changes() || current.route_params.changes() || current.status.changes()) {
		gs.addErrorMessage(gs.getMessage("You do not have permissions to update or delete ServiceNow created content. However, you may deactivate it if needed."));
		current.setAbortAction(true);
	}
	
})(current, previous);
