function onAfter(current, previous) {
	// updates is_default=false for all versions of this service which are currently is_default=true
	// and which are not the current version
	var gr = new GlideRecord('sys_ws_version');
	gr.addQuery('web_service_definition', current.web_service_definition);
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('is_default', true);
	gr.query();
	while (gr.next()) {
		gr.is_default = false;
		gr.update();
	}
}
