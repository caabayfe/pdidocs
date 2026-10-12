(function refineQuery(current, parent) {

	current.addQuery("cmdb_data_management_task",parent.sys_id);
	current.addQuery("ci.attestation_status","Rejected");

})(current, parent);
