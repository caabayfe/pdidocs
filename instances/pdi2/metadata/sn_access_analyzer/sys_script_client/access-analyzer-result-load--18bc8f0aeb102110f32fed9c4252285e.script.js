function onLoad() {
    var aclStatus = g_form.getValue('acl_result');
	if(aclStatus === 'undefined')
        g_form.addInfoMessage(new GwtMessage().getMessage('No ACLs found in debug log'));

	var user = g_form.getValue('sn_access_analyzer_access_result.analyzed_by');
	var opr = g_form.getValue('operation');
	var table = g_form.getValue('sn_access_analyzer_access_result.access_analyzer_request.target_table');
	var result = g_form.getValue('overall_access');

	opr = opr.substring(0, 1).toUpperCase() + opr.substring(1);
    result = result.substring(0, 1).toUpperCase() + result.substring(1);

    if(result == 'Passed') {
		if (g_scratchpad.script_execution == null || g_scratchpad.script_execution == "")
			result = '<span style="padding: 0px 6px 2px 6px; background-color:#00dd00;color:#000000;border-bottom:1px solid #999999;"><b>' + result + '</b><span>';
		else
			result = '<span style="padding: 0px 6px 2px 6px; background-image: url(\'images/alert_obj.gif\'); background-repeat: no-repeat; padding-left: 17px;"><b>' + result + '</b><span>';
		
	}
	else {
		if (g_scratchpad.script_execution == null || g_scratchpad.script_execution == "")
			result = '<span style="padding: 0px 6px 2px 6px; background-color:#ff0000;color:#ffffff;border-bottom:1px solid #999999;"><b>' + result + '</b><span>';
		else
			result = '<span style="padding: 0px 6px 2px 6px; background-image: url(\'images/alert_obj.gif\'); background-repeat: no-repeat; padding-left: 17px;"><b>' + result + '</b><span>';
	}

	g_form.addInfoMessage(new GwtMessage().getMessage('Overall Result: {0} Access for the {1} is {2}', opr, user, result));

}
