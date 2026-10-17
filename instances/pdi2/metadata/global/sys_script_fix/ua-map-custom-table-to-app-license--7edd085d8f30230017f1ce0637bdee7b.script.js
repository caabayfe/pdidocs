mapCustomTables();

function mapCustomTables() {
	
	if (!gs.tableExists('ua_custom_table_inventory')) {
		return;
	}
	
	var dbGR = new GlideRecord('sys_db_object');
	dbGR.addQuery('name', 'STARTSWITH', 'x_').addOrCondition('name', 'STARTSWITH', 'u_');
	dbGR.query();

	while (dbGR.next()) {
		var tableName = dbGR.getValue('name');
		
		var customTableGR = new GlideRecord('ua_custom_table_inventory');
		customTableGR.addQuery('table_name', tableName);
		customTableGR.query();
		
		if (!customTableGR.hasNext()) {
			
			if (SNC.UsageAnalyticsScriptUtils.isNotExemptedTable(tableName)) {
				
				gs.info("UACTFixScript: adding " + tableName + " to custom table inventory");
				var mapGR = new GlideRecord('ua_custom_table_inventory');
				mapGR.initiliaze();
				mapGR.setValue('table_name', tableName);
				mapGR.setValue('table_ref', dbGR.getUniqueValue());
				mapGR.setValue('table_ref_id', dbGR.getUniqueValue());
				mapGR.setValue('table_created_on', dbGR.getValue('sys_created_on'));
				mapGR.insert();
			}
		}
	}
}
