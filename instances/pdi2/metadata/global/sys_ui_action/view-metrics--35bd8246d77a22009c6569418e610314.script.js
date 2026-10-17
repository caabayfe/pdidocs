function openMetricView() {
	var gr = new GlideRecord('em_alert_anomaly');
	gr.addQuery('sys_id',rowSysId);
	gr.query();
	
	if (!gr.next())
		return;
	
	
	var ciSysId = gr.getValue('cmdb_ci');
	OperationalIntelligenceUtils.openMetricView(ciSysId, '/now/sow/metric-explorer-template/params/chart-index/-1');
}
