function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var ga = new GlideAjax('VTBLaneFilterTable');
	ga.addParam('sysparm_name', 'getReferenceTable');
	ga.addParam('sysparm_table_name', g_form.getValue('table'));
	ga.addParam('sysparm_field_name', newValue);
	ga.getXML(vtbLaneFilterTableParse);

	function vtbLaneFilterTableParse(response) {
		var table = response.responseXML.documentElement.getAttribute('answer');
		g_form.setValue('swim_lane_filter_table', table);
	}
}
