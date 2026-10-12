function transform(input) {
	
	var filterValueMap = {};
    var ga = new GlideAggregate("sn_cmdb_ws_ms_ci_dashboard_data");
    ga.addEncodedQuery("chart=cis_with_single_source^state=2");
    ga.addAggregate("SUM", "value");
    ga.groupBy("filter");
    ga.query();
    while (ga.next()) {
        filterValueMap[ga.getValue('filter')] = ga.getAggregate("SUM", "value");
    }
    return filterValueMap;
}
