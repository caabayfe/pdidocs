function onLoad() {
	
	var url = new GlideURL();
	url.setFromCurrent();
	var titleless = url.getParam("sysparm_titleless");
	if(typeof titleless != 'undefined'){
		addHidden(g_form.getFormElement(), 'sysparm_titleless',titleless);
	}
}
