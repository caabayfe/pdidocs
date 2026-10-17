function provideDeleteAccess(tableName) {
 	var gr = new GlideRecord('sys_db_object');
 	gr.addQuery('name', tableName);
 	gr.query();
 	gs.info("Fix Script: Allow Delete for CMDB REL tables - Querying for "+ tableName);
 	if(gr.next()){
 		gs.info("Fix Script: Allow Delete for CMDB REL tables - Delete access for "+ tableName + " is "+ gr.getValue('delete_access'));
 		if(gr.getValue('delete_access') === '0'){
 			gr.setValue('delete_access', '1');
 			gr.update();
 			gs.info("Fix Script: Allow Delete for CMDB REL tables - Providing the delete access for the table " + tableName);
 		}
 	}
 }
 
 provideDeleteAccess('cmdb_rel_ci');
 provideDeleteAccess('cmdb_rel_attributes');
 gs.info("Fix Script: Allow Delete for CMDB REL tables - Finished Execution ");
