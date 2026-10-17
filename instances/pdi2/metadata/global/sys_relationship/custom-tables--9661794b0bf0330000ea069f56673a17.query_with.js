(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	var tableIds = [];
	var recSysIds = []; 
	var tableId = "";
	var subUserGR = new GlideRecord ("subscribed_users_with_role");
	subUserGR.addQuery("userrolect_role_ref", parent.sys_id);
	subUserGR.query();
		
	while (subUserGR.next()) {
		tableId = subUserGR.getValue("userrolect_table_ref");
		if (tableIds.indexOf(tableId) < 0) {
			tableIds.push(tableId);
			recSysIds.push(subUserGR.getValue("userrolect_sys_id"));
		}
	}		
	
	current.addQuery("userrolect_sys_id", "IN", recSysIds);
	current.orderBy("userrolect_table_ref.sys_scope");


})(current, parent);
