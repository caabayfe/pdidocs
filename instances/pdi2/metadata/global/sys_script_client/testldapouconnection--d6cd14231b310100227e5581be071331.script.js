function onLoad() {
	if (!g_scratchpad || g_scratchpad.dotest!="1") 
		return;
	
	if (g_form.isNewRecord())
		return;
	
	g_form.clearMessages();
	
	g_form.addInfoMessage(new GwtMessage().getMessage('LDAP testing OU definition'));
	
    var ldapajax = new GlideAjax('LDAPClientUtils');
	ldapajax.addParam('sysparm_name', 'testOUConnection');
    ldapajax.addParam('sysparm_ouSysId', g_form.getUniqueValue());
    ldapajax.getXML(function(resp){
		g_form.clearMessages();
		var rootElement = resp.responseXML.documentElement;
		var result = rootElement.getElementsByTagName("result");
		var error = result[0].getElementsByTagName("error");
		var code = error[0].getAttribute("code");
		var messages = error[0].getElementsByTagName("message");
		
		if (messages.length>0) { 
		    for(var i=0; i<messages.length; i++) {
				if (code == 0) 
					g_form.addInfoMessage(messages[i].getAttribute("value"));
				else 
			        g_form.addErrorMessage(messages[i].getAttribute("value"));	
			}
		}
		
		if (code == 10500)
			g_form.showFieldMsg('filter', new GwtMessage().getMessage('LDAP OU test Filter field invalid message'),'error');
		
		if (code == 32) 
			g_form.showFieldMsg('ou', new GwtMessage().getMessage('LDAP OU test RDN field invalid message'),'error');

	});
}
