function onLoad() {
	var scriptFiles=[
		'scripts/classes/providers/ProviderUI.js',
		'scripts/classes/providers/wf_provider_client_script_' + g_form.getValue('base_provider') + '.js'
	];
	ScriptLoader.getScripts(scriptFiles, function() {
		ProviderUI.setFields(['input_transform']);
		ProviderUI.apply();
		ProviderUI.removeDisabledAttribute("sys_readonly.wf_element_activity.access");
	});
}
