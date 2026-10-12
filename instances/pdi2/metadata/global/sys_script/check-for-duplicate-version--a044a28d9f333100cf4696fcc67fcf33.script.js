function onBefore(current, previous) {
	// checks for a version other than this one with the same version number
	var gr = new GlideRecord('sys_ws_version');
	gr.addQuery('web_service_definition', current.web_service_definition);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('version', current.version);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Version conflicts with existing version. To add a new version, use the 'Add new version' link from the API definition."));
	}
}
