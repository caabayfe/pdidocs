var gr = new GlideRecord('sys_ui_policy');
if(gr.get('59f027f8c72010106fb2a0e55cc26096')){
	gr.setWorkflow(false);
	gr.deleteRecord();
}
