function transform(input) {	
	var util = new sn_cmdb_ws.CMDBWsDMPolicyTypeManager();

	var inputSysIds = input.sysIds;
	var rowSelection = input.rowSelection;
	if(rowSelection.allRecordsSelected) {
		//call util function with query only
		util.removeRecordsFromExclusionList(rowSelection.query);
	} else {
		util.removeSelectedRecordsFromExclusionList(inputSysIds);
	}
	
	
}	
