var gr = new GlideRecord('sys_dictionary');
gr.addQuery('name','sys_script_vtable');
gr.addQuery('element', 'cache_isolation_level');
gr.query();

if (gr.next()){
	gr.read_only = 'false';
	gr.update();
}
