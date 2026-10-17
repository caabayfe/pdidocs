function onLoad() {
	if (g_form.isNewRecord()) {
		g_form.setValue('source_table', '');
		g_form.setDisabled('source_table', true);
		g_form.setValue('base_condition', '');
		return;
	}
	var aisSearchSourceId = g_form.getValue('ais_search_source');
	if (!aisSearchSourceId)
		return;
	var ga = new GlideAjax('AISSearchSourceAjax');
	ga.addParam('sysparm_name', 'getSearchSourceTableAndCondition');
	ga.addParam('sysparm_sys_id', aisSearchSourceId);
	ga.getXML(getResponse);
	function getResponse(response) {
		var answer = JSON.parse(response.responseXML.documentElement.getAttribute('answer').toString());
		g_form.setValue('source_table', answer.table);
		g_form.setDisabled('source_table', true);
		g_form.setValue('base_condition', answer.condition);
	}
}
