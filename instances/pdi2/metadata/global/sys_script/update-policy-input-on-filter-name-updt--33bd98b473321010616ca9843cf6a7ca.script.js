(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_decision_input");
    if (gr.isValid()) {
		// Add query to check if any Decision Input with filter's element name exists or not
		// if yes then Update the Decision Input (Policy Input) name if the Filter Name is updated.
        gr.addQuery("element", current.element_name);
        gr.setValue("label", current.name);
        gr.updateMultiple();
    }

})(current, previous);
