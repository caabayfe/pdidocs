//read the import tables that expires today and delete them
var gr = new GlideRecord('sys_report_import_table');
gr.addQuery('active','false');
gr.query();
while(gr.next()){
	var deleted = SNC.ImportTableUtils.deleteImportTable(gr.sys_id);
	gs.print('Reporting - Import Tables expire non-active job. Table deleted=' + gr.table);
}
