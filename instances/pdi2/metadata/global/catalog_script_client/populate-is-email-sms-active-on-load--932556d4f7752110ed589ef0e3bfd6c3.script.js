function onLoad() {
	var ga = new GlideAjax('global.AdminConsoleAjaxUtility');
	ga.addParam('sysparm_name', 'isResponseChannelActiveForConfig');
    ga.addParam('sysparm_tableName', g_form.getValue('target_table_name'));
	ga.getXML(process);
}

function process(response) {
	var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
	g_form.setValue('is_email_active', answer['Email']);
}
