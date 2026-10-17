(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_ux_app_route');
	gr.addQuery('route_type', current.route_type);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.addQuery('extension_point', '=', current.extension_point);
	gr.query();
	if (gr.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage("Route - {0}  already exists for this Extension point",[current.route_type]));
		current.setAbortAction(true);
	}

})(current, previous);
