gs.print("**********************************************************************************");
gs.print("Start migration for EM severity 'info' to 'OK'");
gs.print("**********************************************************************************");
processTable('sys_choice');
gs.print("**********************************************************************************");
gs.print("End  migration for EM severity 'info' to 'OK'");
gs.print("**********************************************************************************");

function processTable(tableName) {
	if (isTableExist(tableName)) {
		populateNewTableData(tableName);
	}else{
		gs.log('Verification if table exists failed -' + tableName);
	}
}

//This boolean function checks if given table exists in DB
function isTableExist(tableName) {
	var gr = new GlideRecord(tableName);
	return gr.isValid();
}


//This boolean function checks if given table exists in DB
function populateNewTableData(tableName) {
	var emTables = 	["em_alert_anomaly", 
							"em_alert_history", 
							"em_alert", 
							"em_ci_severity_task", 
							"em_connected_services_trigger_queue", 
							"em_group_impact_relations", 
							"em_impact_rule", 
							"em_impact_status", 
							"em_monitor_state", 
							"cmdb_ci_service_auto", 
							"cmdb_ci_service_group", 
							"em_event", 
							"sa_analytics_alert"];
	
	var gr = new GlideRecord(tableName);
	gr.addQuery('label','info'); 
	gr.addQuery('value','5');
	gr.addQuery('name', 'IN', emTables) // Filter to include only relevant EM tables
	gr.query();

	gs.log(tableName +' Start changing Info to OK in EM tables, records count: ' + gr.getRowCount());
	var counter = 0;
	while (gr.next()){
		//gs.log('name:' + gr.getValue('name') + " element:"+ gr.getValue('element') + " value:" + gr.getValue('value'));
		gr.setValue('label', 'OK');
		gr.update();
		counter++;
	}//end-While
	gs.log(tableName +' End changing Info to OK in EM tables, records count: ' + counter);

}//end-function
