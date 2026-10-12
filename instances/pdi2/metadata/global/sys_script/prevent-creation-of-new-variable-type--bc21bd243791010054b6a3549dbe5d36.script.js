function performCheck() {
	var gr = new GlideRecord("sys_choice");
	gr.addQuery("name", "question");
	gr.addQuery("element", "type");
	gr.addQuery("value", current.value);
	gr.query();
	return gr.hasNext();
}

if (!performCheck()) {
	gs.addInfoMessage(gs.getMessage("New variable types cannot be defined"));
	current.setAbortAction(true);
}
