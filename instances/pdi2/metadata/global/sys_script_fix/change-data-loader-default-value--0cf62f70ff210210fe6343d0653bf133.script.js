var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name','sys_data_source');
gr.addQuery('element', 'data_loader');
gr.query();

if (gr.next()){
	gr.default_value = '(function loadData(import_set_table, data_source, import_log, last_success_import_time, partition_info) {\n\n // Add your code here to insert data to import_set_table \n\n})(import_set_table, data_source, import_log, last_success_import_time, partition_info);';
	gr.update();
}
