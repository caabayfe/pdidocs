function openUrl() {
	var url;
	//if in list view display delete audits for all records
	if (typeof g_list !== 'undefined')
		url = "/hermes_topic_audit_records_list.do?sysparm_query=operation=DELETE^ORDERBYDESCtimestamp";
	//else display delete audit records for specific topic
	else
		url = "/hermes_topic_audit_records_list.do?sysparm_query=operation=DELETE^ORDERBYDESCtimestamp^topic_name=" + g_form.getValue("cluster_topic_name");

	window.open(url, '_blank');
}
