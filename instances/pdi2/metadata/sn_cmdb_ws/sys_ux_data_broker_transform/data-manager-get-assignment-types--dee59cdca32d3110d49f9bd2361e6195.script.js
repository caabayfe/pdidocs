function transform(input) {
	var wrapperFunction = function() {
		var tableName = input.tableName;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var assignmentTypes = [];

		var results = proxy.getAssignmentTypeOptions(tableName);
		for (var i = 0; i < results.length; i++) {
			assignmentTypes.push(results[i]);
		}
		
		return { 
			assignmentTypes: assignmentTypes,
			supportsDotWalkAssignment: new CMDBWorkspaceUtil().isValidField('cmdb_data_management_policy', 'task_management_field_path')
		};
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Assignment Types", wrapperFunction);
}
