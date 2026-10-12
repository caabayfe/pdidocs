function transform(input) {
    var accessVal = "private";
	var pluginId = 'com.glide.rest.policy';
    var gr = new GlideRecord('sys_script_include');
    // get the access of RESTAPIServiceInfo 
    if (gr.get('694a273e670210106fcfecccb585ef08')) {
        accessVal = gr.getValue("access");
    }
	return { 
		id: pluginId,
		active: GlidePluginManager.isActive(pluginId),
		scriptAccess: accessVal
	};
}
