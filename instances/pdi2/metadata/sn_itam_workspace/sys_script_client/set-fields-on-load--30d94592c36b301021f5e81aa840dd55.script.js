function onLoad() {
	if (g_form.isNewRecord()) {
		var ga = new GlideAjax('ITAMWorkspaceClientUtil');
		ga.addParam('sysparm_name', 'getRecord');
		ga.addParam('sysparm_table_name', 'cmdb_software_product_model');
		ga.addParam('sysparm_product_name', g_form.getValue('product_name'));
		ga.addParam('sysparm_fields', ['manufacturer', 'edition', 'version']);
		ga.getXML(function(response) {
			var answer = response.responseXML.documentElement.getAttribute('answer');
			var responseJSON = JSON.parse(answer);
			g_form.setValue('publisher', responseJSON.manufacturer);
			g_form.setValue('norm_version', responseJSON.version);
			g_form.setValue('norm_edition', responseJSON.edition);
		});
		g_form.setValue('source', 'internal');
		g_form.setValue('lifecycle_type', 'internal');
	}
}
