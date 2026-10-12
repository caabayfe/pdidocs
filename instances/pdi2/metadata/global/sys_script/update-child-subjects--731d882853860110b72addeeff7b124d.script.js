(function executeRule(current, previous /*null when async*/ ) {

	// update immediate children. Updaing a child will update its children.
    var gr = new GlideRecord("sys_nowmq_subject");
    gr.addQuery("parent", current.getUniqueValue());
    gr.query();
    while (gr.next()) {
		gs.addInfoMessage(gs.getMessage("Updating child subject: {0}", [gr.getDisplayValue()]));
		gr.setForceUpdate(true);
		gr.update();
    }

})(current, previous);
