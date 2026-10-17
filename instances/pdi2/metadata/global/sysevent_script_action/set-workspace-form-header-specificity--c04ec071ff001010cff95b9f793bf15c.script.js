(function setFormHeaderSpecificity(){
	var gr = new GlideRecord("sys_aw_form_header");
	if (!gr.isValid())
		return;
	gr.addNullQuery('specificity');
	gr.orderBy('table');
	gr.query();
	var table = null;
	var size = 0;
	while (gr.next()) {
		if (table !== gr.getValue('table')) {
			table = gr.getValue('table');
			size = GlideDBObjectManager.getTables(table).size();
		}
		var specificity = 10 * size + Boolean(gr.getValue('workspace'));
		gr.setValue('specificity', specificity);
		gr.setWorkflow(false);
		gr.update();
		gs.info('set record: ' + gr.getUniqueValue() + ' with specificity: ' + specificity.toString());
	}
})();
