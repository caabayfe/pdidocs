function onLoad() {
	var url = new GlideURL();
	url.setFromCurrent();
	var ids = url.getParam('sysparm_target_list');
	if(ids){
		var time = new Date();
		var gwt = new GwtMessage();
		g_form.setValue('name', gwt.getMessage('Application Service Conversion: {0} {1}', time.toLocaleDateString(), time.toLocaleTimeString()));
		g_form.setValue('selected_cis', ids);
	}
}
