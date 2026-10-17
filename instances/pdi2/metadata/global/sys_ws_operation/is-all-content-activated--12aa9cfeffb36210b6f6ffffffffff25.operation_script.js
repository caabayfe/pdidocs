(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	function getNonActivatedRecordsCount(table) {
		var isDomainSeparated = new SNC.PADomainUtils().isDomainSeparated();

		var migratedRecords = new GlideAggregate(table);
		migratedRecords.addQuery("is_last", "true");
		migratedRecords.addNullQuery("active");
		migratedRecords.addAggregate("COUNT");
		if (isDomainSeparated)
			migratedRecords.queryNoDomain();
		else
			migratedRecords.query();
		
		if (migratedRecords.next())
			return migratedRecords.getAggregate("COUNT");

		return -1;
	}
	
	var cnt = getNonActivatedRecordsCount("par_coreui_migration_bridge_dashboard");
	if (cnt > 0)
		return false;

	cnt = getNonActivatedRecordsCount("par_coreui_migration_bridge_component");
	if (cnt > 0)
		return false;

	return true;

})(request, response);
