function getDefaultVersion() {
	var defaultVersion = 'No active default version';
	var gr = new GlideRecord('sys_ws_version');
	gr.addQuery('web_service_definition', current.sys_id);
	gr.addQuery('active', true);
	gr.orderByDesc('version');
	gr.query();
	
	while(gr.next()){
		if(gr.getValue('is_default') == '1'){
			defaultVersion = gr.getValue('version_id');
			break;
		}
	}
	
	return defaultVersion;
}

current.default_version = getDefaultVersion();
