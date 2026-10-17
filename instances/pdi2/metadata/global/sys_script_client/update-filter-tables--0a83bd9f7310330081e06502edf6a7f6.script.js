function onLoad() {
	g_form.setReadOnly('lane_filter_table', true);
	g_form.setReadOnly('swim_lane_filter_table', true);

	if (g_form.isNewRecord()) return;

	var ga = new GlideAjax('VTBLaneFilterTable');
	ga.addParam('sysparm_name', 'getReferenceTable');
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.getXML(vtbFilterTableParse);

	function vtbFilterTableParse(response) {
		try {
			var table = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
			g_form.setValue('lane_filter_table', table.lane);
			g_form.setValue('swim_lane_filter_table', table.swim_lane);
		} catch(e) {}
	}
}
