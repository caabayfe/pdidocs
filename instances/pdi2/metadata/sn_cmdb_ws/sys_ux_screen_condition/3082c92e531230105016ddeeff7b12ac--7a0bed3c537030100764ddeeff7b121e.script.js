(function showServiceRelTab(params) {
	var table = gs.nil(params.data.table) ? '' : params.data.table;
	if (table == '') {
		return false;
	}
	var aclGr = new GlideRecord(table);
	if (!aclGr.isValid() || !aclGr.canRead()) {
		return false;
	}
	
	var util = new sn_cmdb_pg_templts.CMDBPageTemplatesUtility();
	return util.isExtensionOfCmdbCi(table); 
})(inputProperties);
