var gr = new GlideRecord('sys_remote_app');
gr.addQuery('sys_code', 'undefined');
gr.query();
gs.info("Number of records where 'sys_code' is 'undefined' in the 'sys_remote_app' table: " + gr.getRowCount());
gr.setValue('sys_code', 'NULL');
gr.updateMultiple();
