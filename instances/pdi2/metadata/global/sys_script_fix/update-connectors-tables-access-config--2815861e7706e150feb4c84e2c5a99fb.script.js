var logIdentifier = 'SOW Integrations Launchpad - "Update Connectors Tables Access Config" Fix Script: ';
var tableNameArr = ['em_connector_instance','em_connector_instance_to_mid'];
tableNameArr.forEach(function(tableName){
	var gr = new GlideRecord('sys_db_object');
	gr.addQuery('name', tableName);
	gr.query();

	if (gr.next()) {
		if (gr.getValue('delete_access') === '0') {
			gr.setValue('create_access', '1');
			gr.setValue('read_access', '1');
			gr.setValue('update_access', '1');
			gr.setValue('delete_access', '1');
			gr.setValue('ws_access', '1');
			gr.update();
			gs.info(logIdentifier + tableName + ' Provided missing accesses for table');
		} else {
			gs.info(logIdentifier + tableName + ' Required accesses are already configured for table.');
		}
	}
});
