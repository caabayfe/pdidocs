function onLoad() {
    var isRuleActive = g_form.getValue('active');
    if (isRuleActive === 'true') {
        var table = g_form.getValue('tablename');
        var ga = new GlideAjax('global.DMPolicyUtil');
        ga.addParam('sysparm_name', 'hasActiveTablePolicy');
        ga.addParam('sysparm_tablename', table);
        ga.getXMLAnswer(callback);
    }
}

function callback(response) {
    if (response === 'false') {
		var table = g_form.getValue('tablename');
        var hyperlink = '<a href="sys_dm_policy.do?sysparm_query=tablename=' + table + '">data management policy</a>';
        var gwt = new GwtMessage();
        var warning = gwt.getMessage( "Attention: The data management policy for this table is presently inactive. To activate the table cleaner rule, ensure that the {0} for the table is set to active.", hyperlink);
        g_form.addWarningMessage(warning);
    }
}
