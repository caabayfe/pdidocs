var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name','sys_parallel_job');
gr.addQuery('element', 'retry_count');
gr.query();

if (gr.next()){
	gr.default_value = '-1';
	gr.update();
}
