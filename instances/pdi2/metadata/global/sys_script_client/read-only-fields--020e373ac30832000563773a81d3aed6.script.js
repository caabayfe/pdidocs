function onLoad() {
	var gr = new GlideRecord("em_alert_promotion_rule");
	gr.addQuery('sys_id',rowSysId);
	gr.query();
	if (gr.next()){
		if (gr.getValue("type") != ''){
			g_form.setReadOnly('source', g_form.getValue('source') != '');
			g_form.setReadOnly('metric_name', g_form.getValue('metric_name') != '');
			g_form.setReadOnly('cmdb_ci', g_form.getValue('cmdb_ci') != '');
			g_form.setReadOnly('ci_type', g_form.getValue('ci_type') != '');
			g_form.setReadOnly('promotion_parameter', g_form.getValue('promotion_parameter') != '');
		}
	}   
}
