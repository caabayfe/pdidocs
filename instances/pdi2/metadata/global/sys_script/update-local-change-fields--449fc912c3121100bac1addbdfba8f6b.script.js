var gr = new GlideRecord('sys_sync_change');
if (gr.get('version', current.sys_id)) {
	gr.update_set = current.source;
	gr.setWorkflow(false);
	gr.setSystem(true);
	gr.update();
}
