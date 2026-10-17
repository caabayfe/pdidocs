function submitRecordClient(){
	if (g_form.getValue('authentication.key') === "" && 
		g_form.getValue('authentication.secret') === "") {
		gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert_mb');
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
	gsftSubmit(null, g_form.getFormElement(), 'sysverb_insert_mb');
}


if (typeof window == 'undefined')
	submitRecordServer();

function submitRecordServer() {
	current.insert();
    gs.include('ActionUtils');
    var au = new ActionUtils();
    au.postInsert(current);
}
