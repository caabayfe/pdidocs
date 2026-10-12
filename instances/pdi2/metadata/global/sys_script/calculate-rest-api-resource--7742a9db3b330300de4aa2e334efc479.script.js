(function executeRule(current, previous) {
	var end_point = current.api_resource;
	if(!end_point){
		abortAndAddErrorMsg("Resource");
		return;
	}
	
	var pattern = new RegExp("now(\/v[0-9]+)?\/(table|import|stats)\/");
	if(pattern.test(end_point))
		setRestAPIResourceForTableRelatedAPI(end_point);
	else
		current.rest_api_resource = end_point;
	
})(current, previous);

function abortAndAddErrorMsg(fieldName){
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Field: " + fieldName + " is not populated"));
}

function setRestAPIResourceForTableRelatedAPI(end_point){
	if(end_point.indexOf('/import/{stagingTableName}') > 0){
		//Import API
		var importTable = current.import_set_table;
		if(importTable)
			current.rest_api_resource = end_point.replace('{stagingTableName}',importTable);
		else
			abortAndAddErrorMsg("Import set table");
		
	} else {
		//Table or Stats API
		var table = current.table;
		if(table)
			current.rest_api_resource = end_point.replace('{tableName}',table);
		else
			abortAndAddErrorMsg("Table");
		
	}
}
