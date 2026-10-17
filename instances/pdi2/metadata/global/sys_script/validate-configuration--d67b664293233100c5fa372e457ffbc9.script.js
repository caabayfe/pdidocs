function onBefore(current, previous) {
	if(gs.tableExists(current.date_table)) {
		var gr = new GlideRecord(current.date_table);
		var ed = gr.getElement(current.date_field).getED();
		if(!ed.isDateType()) {
			current.date_field.setError(gs.getMessage('Selected field is not of type Date'));
			current.setAbortAction(true);
		}
	}
}
