// the current logic is to have one cred_store per process,
// but we do have a proc_to_cred_store m2m mapping table to
// support multiple cred stores per process in the future,
// but now, we're going to update that table using cred_store
// reference field.

run();

function run() {
	if (current.cred_store == previous.cred_store) {
		// no changes
		return;
	}
	
	var gr = new GlideRecord('pwd_map_proc_to_cred_store');
	gr.addQuery('process', current.sys_id);
	gr.query();
	gr.deleteMultiple();
	
	if (current.cred_store.nil()) {
		return;
	}
	gr.initialize();
	gr.setValue('process', current.sys_id);
	gr.setValue('cred_store', current.cred_store.sys_id);
	gr.insert();
}
