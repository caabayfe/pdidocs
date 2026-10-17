function transform(input) {
	var util = new CMDBWorkspaceUtil();
	var wrapperFunction = function() {
		var assignmentTypeId = input.assignmentTypeId;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var typeAheadOptions = [];
		var dotWalkAssignmentLabels = [];
		if (!gs.nil(input.assignmentFieldPath)) {
			dotWalkAssignmentLabels = util.getDotWalkFieldLabels(input.tableName, input.assignmentFieldPath)
		}

		switch(assignmentTypeId) {
			case "user_group_field":
				var userGroupFields = proxy.getGroupFieldsForTable(input.tableName);
				for (var i = 0; i < userGroupFields.length; i++) {
					typeAheadOptions.push({
						"id": userGroupFields[i].sys_id,
						"label": userGroupFields[i].label
					});
				}
				if (!gs.nil(input.assignmentFieldPath)) {
					typeAheadOptions.push({
						id: input.assignmentFieldPath,
						label: dotWalkAssignmentLabels.join(' > '),
						type: "fieldPath"
					});
				}
				break;
			case "specific_user":
				var users = proxy.getAssignmentSearchResults({
					"searchTerm": input.searchTerm && input.searchTerm.length > 2 ? input.searchTerm : "",
					"userAssignmentSysId": input.userAssignmentSysId
				});

				for (var i = 0; i < users.length; i++) {
					typeAheadOptions.push({
						"id": users[i].value,
						"label": users[i].name
					});
				}
				break;
			case "specific_user_group":
				var groups = proxy.getAssignmentSearchResults({
					"searchTerm": input.searchTerm && input.searchTerm.length > 2 ? input.searchTerm : "",
					"userGroupAssignmentSysId": input.userGroupAssignmentSysId
				}

				);
				for (var i = 0; i < groups.length; i++) {
					typeAheadOptions.push({
						"id": groups[i].value,
						"label": groups[i].name
					});
				}
				break;
			case "user_field":
				var userFields = proxy.getUserFieldsForTable(input.tableName);
				for (var i = 0; i < userFields.length; i++) {
					typeAheadOptions.push({
						"id": userFields[i].sys_id,
						"label": userFields[i].label
					});
				}
				if (!gs.nil(input.assignmentFieldPath)) {
					typeAheadOptions.push({
						id: input.assignmentFieldPath,
						label: dotWalkAssignmentLabels.join(' > '),
						type: "fieldPath"
					});
				}
				break;
		}
		return typeAheadOptions;
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Get Assignment Options", wrapperFunction);
}
