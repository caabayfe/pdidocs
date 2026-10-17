function saveUpdateClient(){
	if (g_form.getValue('authentication.key') === "" && 
		g_form.getValue('authentication.secret') === "") {
		//no credentials entered, don't create authentication record
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_update_stay_mb');
		return; 
	}
	if (g_form.getValue('authentication')) {
		//authentication record exists, already, don't create new one
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_update_stay_mb');
		return;
	}
	var ga = new GlideAjax('MBConfig'); 
	ga.addParam('sysparm_name', 'updateAuthentication'); 
	ga.addParam('sysparm_key', g_form.getValue('authentication.key')); 
	ga.addParam('sysparm_secret', g_form.getValue('authentication.secret'));
	ga.getXML(setAuthentication); 
}

function setAuthentication(response) { 
    var auth = response.responseXML.documentElement.getAttribute('answer'); 
	g_form.setValue('authentication',auth);
	if (!g_form.getValue('authentication')) 
		alert(getMessage('EndpointAuthenticationFailure'));
	gsftSubmit(null, g_form.getFormElement(), 'sysverb_update_stay_mb');
}


if (typeof window == 'undefined')
	saveUpdateServer();

function saveUpdateServer() {
	action.setRedirectURL(current);
	current.update();
	if (! current.isActionAborted())
		action.setRedirectURL(current);

}
