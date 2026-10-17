function openMetricView() {
	var ciSysId = g_form.getValue('cmdb_ci');
	OperationalIntelligenceUtils.openMetricView(ciSysId, '/now/sow/metric-explorer-template/params/chart-index/-1');
}
