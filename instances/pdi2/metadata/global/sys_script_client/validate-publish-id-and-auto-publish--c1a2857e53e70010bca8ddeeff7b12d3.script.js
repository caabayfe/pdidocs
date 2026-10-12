function onLoad() {
	var tableName = g_form.getTableName();
	var sysId = g_form.getUniqueValue();
	
	if (tableName && sysId) {
		var glideAjax = new GlideAjax('AisConfigurationAjax');
		glideAjax.addParam('sysparm_name', 'validatePublishIDAndAutoPublish');
		glideAjax.addParam('sysparm_table_name', tableName);
		glideAjax.addParam('sysparm_sys_id', sysId);
		glideAjax.getXML();
	}
}
