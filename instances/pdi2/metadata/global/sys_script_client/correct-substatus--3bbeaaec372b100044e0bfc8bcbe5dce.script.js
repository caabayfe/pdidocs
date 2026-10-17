function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    function parseResponse(serverResponse){
		var value = serverResponse.responseXML.documentElement.getAttribute('answer');
		g_form.clearMessages();
    var msg = getMessage("The state of this entitlement has been set to '{0}'.  It will be now available for reconciliation and other reporting needs.").replace('{0}', value);
		g_form.addInfoMessage(msg);
	}
	
	if (newValue == '') {
        return;
    }

    var setSubstatusReadOnly = false;
    if (newValue == '2' || newValue == '3' || newValue == '10') {
        if (!isLoading) {
            g_form.setValue('substatus', '');
        }
        setSubstatusReadOnly = true;
    } else if (newValue == '6' && !isLoading) {
		g_form.setValue('substatus', 'available');
	}
    g_form.setReadOnly('substatus', setSubstatusReadOnly);
	
	if (g_form.getTableName() === 'alm_license' && !isLoading && !g_form.isNewRecord() && parseInt(oldValue, 10) === 1 && parseInt(newValue, 10) !== 1) {
		g_form.clearMessages();
        g_form.addWarningMessage(getMessage('You have changed the state of this entitlement. This entitlement will no longer be available for reconciliation.'));
    } else if (g_form.getTableName() === 'alm_license' && !isLoading && !g_form.isNewRecord() && parseInt(newValue, 10) === 1 && parseInt(oldValue, 10) === parseInt(newValue, 10)) {
        var ga = new GlideAjax('SAMPAjaxProcessor');
		ga.addParam('sysparm_name', 'getEntitlementStateLabel');
		ga.addParam('sysparm_status_value', g_form.getValue('install_status'));
		ga.getXML(parseResponse);
    }
	
    return;
}
