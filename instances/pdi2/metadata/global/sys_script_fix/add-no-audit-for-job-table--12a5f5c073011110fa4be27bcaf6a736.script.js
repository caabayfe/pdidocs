(function() {
	var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'sys_mass_encryption_job');
    gr.addQuery('element', 'IN', "summary,context");
    gr.query();
    while (gr.next()) {
		var oldValue = gr.getValue("attributes");
		if (gs.nil(oldValue))
			oldValue = "";
		else
			oldValue += ",";
		var newValue = oldValue + "no_audit=true";
		gr.setWorkflow(false);
		gr.setValue("attributes",newValue);
		gr.update();
		gs.info("Added no_audit = true to sys_mass_encryption_job." + gr.getValue('element') + " in sys_dictionary");
	}
})();
