function onBefore(current, previous) {
	if(current.type == 1) {
		if(gs.tableExists(current.source_table)) {
			var gr = new GlideRecord(current.source_table);
			var ed = gr.getElement(current.source_field).getED();
			if(!ed.isChoiceTable()) {
				current.source_field.setError(gs.getMessage('Selected field is not a choice list'));
				current.setAbortAction(true);
			}
		}
	} 
}
