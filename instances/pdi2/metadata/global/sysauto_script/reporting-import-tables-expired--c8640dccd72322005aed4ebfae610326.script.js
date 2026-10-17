//read the import tables that expires today and delete them
var gr = new GlideRecord('sys_report_import_table');
gr.addQuery('active','true');
gr.addQuery('expire_on_date', '<=' , new GlideDateTime().getDate());
gr.query();
while(gr.next()){
	var deleted = SNC.ImportTableUtils.deleteImportTable(gr.sys_id);
	if (deleted)
		gs.print('Reporting - Import Tables expired job. Table deleted=' + gr.table);
	else {
		// there is an issue deleting the table. Make the table invalid so it won't appear in the 
		// report table dropdown list
		gr.setValue('active', false);
		gr.setValue('expired', true);
		gr.update();
		gs.print('Reporting - Import Tables expired job. There is a problem deleting the table=' + gr.table);
	}
	
	// throw the event to sent a notification to the user that the data has expired
	var event = 'report.import.expire_on_date.expired';	
	gs.eventQueue(event, gr, gr.getValue('created_by_user'));
		
}
