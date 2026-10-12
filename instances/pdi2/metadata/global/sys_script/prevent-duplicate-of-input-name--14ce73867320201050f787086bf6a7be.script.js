(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord("sys_sg_input");
	gr.addNotNullQuery("parameter_screen");
    gr.addQuery("parameter_screen", current.getValue("parameter_screen"));
    gr.addQuery("name", current.getValue("name"));
    gr.query();
    if (gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
        gs.addErrorMessage(gs.getMessage("Duplicate parameter input name. "));
        current.setAbortAction(true);
    }

})(current, previous);
