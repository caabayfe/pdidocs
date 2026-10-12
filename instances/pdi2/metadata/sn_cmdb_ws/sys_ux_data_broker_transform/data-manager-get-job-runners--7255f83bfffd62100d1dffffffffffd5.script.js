function transform(input){
	var wrapperFunction = function(){
		var currUserId = input?.currRunAsUserId;
		var userGroupId = input?.userGroupId?.value;
		var canEditMcc = input?.mccCanEdit || false;

		var proxy = new CMDBWsDMPolicyUIProxy();
		var userList = proxy.getJobRunnersList(userGroupId, currUserId);

		//used when the userList is populating a MCC typeahead
		var mccPayload = {
				"defaultValue": null,
				"element": "name",
				"label": "User Group",
				"mandatory": false,
				"maxLength": "32",
				"readOnly": canEditMcc ? false : true,
				"referenceQualifier": null,
				"referenceTable": "sys_user_group",
				"type": "reference"
		};

		return {
			"userList": userList,
			"mccPayload": mccPayload
		};
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data manager get job runners", wrapperFunction);

}
