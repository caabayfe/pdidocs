function writeBootstrapXML() {
	var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
	ga.addParam('sysparm_table_id', g_form.getUniqueValue());
	ga.addParam('sysparm_table', g_form.getValue('label'));
	ga.addParam('sysparm_function', 'writeBootstrapXML');
	ga.getXMLAnswer();
}
