function onCondition() {
	var route = g_form.getUniqueValue('route_type');
	var ga = new GlideAjax('GetRouteMessage');
	ga.addParam('sysparm_name', 'getLocalizedMessage');
	ga.addParam('route', route);
	ga.getXMLAnswer(process); 

	function process (message){
		g_form.addInfoMessage(message, 'enabled-cross-experience-usage');
	}
}
