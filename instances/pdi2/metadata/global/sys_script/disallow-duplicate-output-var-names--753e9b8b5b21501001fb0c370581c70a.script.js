(function executeRule(current, previous /*null when async*/) {

	var templateOutputVar = new GlideRecord("sys_app_template_output_var");
	templateOutputVar.addQuery("name", current.name);
	templateOutputVar.addQuery("template", current.template);
	templateOutputVar.query();
	
	if (templateOutputVar.next() && templateOutputVar.getUniqueValue() != current.sys_id) {
		var message = gs.getMessage('A Template Output Variable with the name \'{0}\' already exists for \'{1}\' template (sys_id=\'{2}\')', 
									[current.name, current.template.name, current.template]);

		gs.addErrorMessage(message);
		
		current.setAbortAction(true);
  }
})(current, previous);
