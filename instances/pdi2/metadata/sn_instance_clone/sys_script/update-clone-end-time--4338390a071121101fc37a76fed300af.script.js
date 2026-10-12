(function executeRule(current, previous /*null when async*/) {

	var gdt = new GlideDateTime();
	current.setValue('completed', gdt.getValue());
	current.setWorkflow(false);
	current.update();
	current.setWorkflow(true);

})(current, previous);
