var gr = new GlideRecord('nlq_table_guesser_query_log');
gr.query(); 
while (gr.next()) {
    gr.setValue('total_time', (gr.getValue('total_time') / 1000000).toFixed(3));
    gr.setWorkflow(false);
    gr.update();
} 
// explicitly update hint as it does not 
// get updated from dict folder
var gc = new GlideRecord('sys_documentation');
gc.addQuery('name', 'nlq_table_guesser_query_log');
gc.addQuery('language', 'en');
gc.query();
while (gc.next()) {
	if (gc.getValue('element') == 'total_time') {
        gc.setValue('hint', 'Total time in milliseconds');
		gc.setWorkflow(false);
        gc.update();
    }
}
