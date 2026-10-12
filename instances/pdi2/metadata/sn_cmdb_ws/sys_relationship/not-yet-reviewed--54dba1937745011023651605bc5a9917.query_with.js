(function refineQuery(current, parent) {

	current.addQuery("cmdb_data_management_task",parent.sys_id);
	current.addEncodedQuery("ci.attestation_status=Not Yet Reviewed");

})(current, parent);
