if (GlidePluginManager.isActive('com.snc.agent_workspace.itsm')) {
	var typesGR = new GlideRecord('aw_record_type_selector');
	typesGR.addNullQuery('active');
	typesGR.query();

	typesGR.setWorkflow(false);
	while (typesGR.next()) {
		typesGR.setValue('active', true);
		typesGR.update();
	}
}
