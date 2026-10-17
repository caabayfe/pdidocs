(function executeRule(current, previous /*null when async*/) {

	var templateInputVar = new GlideRecord("sys_app_template_input_var");
	templateInputVar.addQuery("name", current.name);
	templateInputVar.addQuery("template", current.template);
	templateInputVar.query();
	
	if (templateInputVar.next() && templateInputVar.getUniqueValue() != current.sys_id) {
		var message = gs.getMessage('A Template Input Variable with the name \'{0}\' already exists for \'{1}\' template (sys_id=\'{2}\')', 
									[current.name, current.template.name, current.template]);
		gs.addErrorMessage(message);
		
		current.setAbortAction(true);
  }
})(current, previous);
