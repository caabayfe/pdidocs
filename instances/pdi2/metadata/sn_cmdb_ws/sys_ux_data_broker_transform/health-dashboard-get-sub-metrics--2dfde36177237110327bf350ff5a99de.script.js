function transform(input) {

	var util = new sn_cmdb_ws.CMDBWsHealthDashboardUtil();
	var id = input.id;
	var dataType = input.dataType;
	var metric = input.metric;
	return util.getSubMetrics(dataType,id,metric);

}
