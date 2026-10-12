function enableVersioning(){
	var ga = new GlideAjax('AddScriptedRESTVersionAjax');
	ga.addParam('sysparm_name','enableVersion');
	var custom_ws_definition_sys_id = gel('service_definition_id').value;
	var set_default = gel('ni.default').checked;
	ga.addParam('sysparm_service_definition',custom_ws_definition_sys_id);
	ga.addParam('sysparm_set_default', set_default);
	ga.getXML(function (response) {
		// g_scratchpad.info_msg = 'Scripted_REST_Versioning_Enabled';
		location.reload();
	});
}
