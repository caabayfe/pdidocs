function deleteExtraChoice() {
	var choices = new GlideRecord("sys_choice");
	choices.addQuery("name", "sys_email");
	choices.addQuery("element", "type");
	choices.addQuery("language", "en");
	choices.addQuery("label", "send-ready");
	choices.addQuery("inactive", "false");
	choices.setWorkflow(false);
	choices.query();

	//We need one choice => Forward the pointer once and don't delete it	
	choices.next();

	if (choices.getRowCount() > 1) {
		while (choices.next()) {
			gs.debug("deleting the extra choice(sys_email.type.send-ready): " + choices.getUniqueValue());
			choices.deleteRecord();	
		}
	} else {
		gs.debug("only one choice available for sys_email.type.send-ready");
	}
}
deleteExtraChoice();
