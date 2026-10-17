(function setDASpecificity(){
	var gr = new GlideRecord("sys_declarative_action_assignment");
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
			size = table === 'global' ? 0 : GlideDBObjectManager.getTables(table).size();
		}
		var specificity = Boolean(gr.sys_domain) + size * 10 + Boolean(gr.view) + Boolean(gr.workspace);
		gr.setValue('specificity', specificity);
		gr.setWorkflow(false);
		gr.update();
	}
})();
