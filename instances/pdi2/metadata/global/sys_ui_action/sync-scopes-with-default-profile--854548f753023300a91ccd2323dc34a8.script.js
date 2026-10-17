function updateScopes() {
	var ga = new GlideAjax('AJAXAddScopes');
	ga.addParam('sysparm_name', 'addScopes');
	ga.addParam('sysparm_oauthEntityId', g_form.getUniqueValue());
	ga.getXML();
	setTimeout(function() {reloadWindow(self);}, 1);
}
