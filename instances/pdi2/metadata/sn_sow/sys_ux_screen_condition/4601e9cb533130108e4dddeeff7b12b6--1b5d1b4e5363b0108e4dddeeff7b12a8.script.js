(function showInfrastructureRelTab(params) {
	var table = gs.nil(params.table) ? '' : params.table;
	if (table == '') {
		return false;
	}
	
	var util = new sn_cmdb_pg_templts.CMDBPageTemplatesUtility();
	
	return util.isExtensionOfCmdbCi(table); 
})(inputProperties);
