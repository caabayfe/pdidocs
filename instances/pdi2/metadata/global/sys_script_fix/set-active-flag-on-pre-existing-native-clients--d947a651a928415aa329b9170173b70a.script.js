(function() {
	var gr = new GlideRecord('sys_sg_native_client');
	gr.addEncodedQuery('activeISEMPTY^ORactive=false');
	gr.setWorkflow(false);
	gr.query();
	while (gr.next()) {
		gr.setValue('active', true);
		gr.update();
	}
})();
