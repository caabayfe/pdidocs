function transform(input) {
	var result = "default";
	
	if (!input.table) {
		return results;
	}
	
	switch(input.table) {
		case "cmdb_multisource_query_result":	
			result = gs.getMessage("CMDB 360 Query Results");
			break;
		case "cmdb_multisource_query_result_diff_record":
			result = gs.getMessage("CMDB 360 Query Diff Results");
			break;
		case "cmdb_multisource_query_result_ms_record":
			result = gs.getMessage("CMDB 360 Query CI/Discovery Source Results");
			break;
		default : {
			var fields = new GlideRecord('sys_db_object');
			fields.addQuery('name', input.table);
			fields.query();
	
			if(fields.next()) {
				result = fields.getValue("label");
			}
		}
	}
	
	
	return result;
	
}
