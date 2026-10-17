function onLoad() {
    
    // don't test for new record
    if (g_form.isNewRecord())
        return;

	// specific request to not run the test
	if ("0" == g_scratchpad.dotest)
		return;

	// our display type business rule always creates g_scratchpad object
    // do test if dotest is "1", if dotest is not "1", don't do test if it uses mid server
    if ("1" != g_scratchpad.dotest)
		if("1" == g_scratchpad.use_mid_server || "1" != g_scratchpad.isActive)
			return;

	g_form.clearMessages();
    
    var quitTesting = false;
    if (g_form.getValue('dn') == '') {
        g_form.addInfoMessage(new GwtMessage().getMessage('LDAP conn test please enter a Login distinguished name'));
        quitTesting = true;
    }
    if (quitTesting)
        return;
    
    g_form.addInfoMessage(new GwtMessage().getMessage('LDAP testing connection'));
    
    var ldapajax = new GlideAjax('LDAPClientUtils');
    ldapajax.addParam('sysparm_name', 'testServerURLConnections');
    ldapajax.addParam('sysparm_serverSysId', g_form.getUniqueValue());
    ldapajax.getXML(function(resp){
        g_form.clearMessages();
        
        processMultiURLStatus(resp.responseXML);
    });
}

function processMultiURLStatus(responseXML) {
    g_ldapFieldErrors = {};
    var rootElement = responseXML.documentElement;
    var result = rootElement.getElementsByTagName("result");
    
    var errors = result[0].getElementsByTagName("error");
    // Loop through <error> elements
    for (var i = 0; i < errors.length; i++) {
        var code = errors[i].getAttribute("code");
        var messages = errors[i].getElementsByTagName("message");
        printLDAPMessages(code, messages);
    }

	// Refresh ldap_server_url embedded list
	var divs = $$('div[tab_list_name_raw="ldap_server_config.ldap_server_url.server"]');
	if (divs && divs.length  > 0 ) {
		var full_list_id = divs[0].id;
		if (full_list_id && full_list_id.indexOf('_list') > 0) {
			var list_id = full_list_id.substring(0,full_list_id.length-5);
			var list = GlideLists2.get(list_id);
			list.refresh();
		}
	}

	// Refresh server_url calculated field if it is present on the form
	var serverURLElement = g_form.getGlideUIElement('server_url');
	var serverURLControl = g_form.getControl('server_url');
	if(serverURLElement && serverURLControl && g_form.isVisible(serverURLElement, serverURLControl)) {
		var urlajax = new GlideAjax('LDAPURLClientUtils');
		urlajax.addParam('sysparm_name', 'getAccumURLWrapper');
		urlajax.addParam('sysparm_serverSysId', g_form.getUniqueValue());
		urlajax.getXMLAnswer(function(answer){
			g_form.setValue('ldap_server_config.server_url', answer);
    	});
	}
}

function printLDAPMessages(code, messages) {
    if (messages.length > 0) {
        for(var i=0; i<messages.length; i++) {
            if (code == 0)
                g_form.addInfoMessage(messages[i].getAttribute("value"));
            else if (code == -1)
                g_form.addInfoMessage(messages[i].getAttribute("value"));
            else
                g_form.addErrorMessage(messages[i].getAttribute("value") + extraErrorMessage(code) );
        }
    }
    ldapFieldMessageForCode(code);
}

function extraErrorMessage(code) {
    if (code >= 10300 && code <= 10399)
        return '<br/>' + new GwtMessage().getMessage('LDAP conn test server_url field invalid message');
    return '';
}

function ldapFieldMessageForCode(code) {
    if (code == 40100 && !g_ldapFieldErrors[code]){
        g_ldapFieldErrors[code] = true;
        g_form.showFieldMsg('mid_server', new GwtMessage().getMessage('LDAP conn test mid_server field invalid message'),'error');
    }
    else if (code == 34 && !g_ldapFieldErrors[code]){
        g_ldapFieldErrors[code] = true;
        g_form.showFieldMsg('dn', new GwtMessage().getMessage('LDAP conn test dn field invalid syntax'),'error');
    }
    else if ((code == 49 || code == 10002) && !( g_ldapFieldErrors[49] || g_ldapFieldErrors[10002]) ){
        g_ldapFieldErrors[code] = true;
        g_form.showFieldMsg('dn', new GwtMessage().getMessage('LDAP conn test dn field invalid message'),'error');
        g_form.showFieldMsg('password', new GwtMessage().getMessage('LDAP conn test password field invalid message'),'error');
    }
}
