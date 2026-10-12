function onLoad() {
	var getUIPolicyTableName = new GlideAjax('GetUIPolicyTable');
	getUIPolicyTableName.addParam('sysparm_name', 'getUIPolicyTableName');
	getUIPolicyTableName.addParam('sysparm_ui_policy_id', g_form.getValue('ui_policy'));
	getUIPolicyTableName.getXML(setUIPolicyTable);

	function setUIPolicyTable(uiPolicyTableAnswer) {
		var uiPolicyTable = uiPolicyTableAnswer.responseXML.documentElement.getAttribute('answer');
		g_form.setValue('table', uiPolicyTable);
	}
}
