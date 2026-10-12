(function executeRule(current, previous /*null when async*/) {
	
	var spInstanceId = current.getValue('sys_id');
	g_scratchpad.spWidgetDataTable = getDataTable();
	
	function getDataTable() {
		var dataTable = '';
		var gr = new GlideRecord('sp_instance_ais');
		if (gr.get(spInstanceId))
			dataTable = gr.sp_widget.data_table;
		return dataTable;
	}
	
})(current, previous);
