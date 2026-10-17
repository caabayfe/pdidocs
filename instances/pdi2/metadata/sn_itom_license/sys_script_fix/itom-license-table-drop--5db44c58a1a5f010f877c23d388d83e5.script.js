// Droping all the otom tables as we have created new otm tables
var tableList = ['otom_health_exclusions','otom_visibility_exclusions','otom_optimization_exclusions']
tableList.forEach(function(tableName) {
	var tUtil = new global.UtilScript().getTableUtil(tableName);
	if(tUtil.tableExists()) {
		tUtil.dropAndClean(tableName);
		gs.info('Dropping ITOM License Table: '+ tableName);
	}
});	
