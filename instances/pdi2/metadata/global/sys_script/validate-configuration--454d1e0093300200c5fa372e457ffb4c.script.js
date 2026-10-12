function onBefore(current, previous) {
	
	var publisher_reference = current.publisher_reference.reference_table;
	var reference_table = current.reference_table;
	var reference_field = current.reference_field;
	
	var gr = new GlideRecord(reference_table);
	
	if(gr.isValid()) {
		var element = gr.getElement(reference_field);
		if(!element.getName()) {
			gs.addErrorMessage(gs.getMessage('Invalid field "{0}"', reference_field));
			current.setAbortAction(true);
		} else {
			var ed = element.getED();
			if(publisher_reference != ed.getReference()) {
				gs.addErrorMessage(gs.getMessage('Reference field "{0}" is not of type "{1}"', [reference_field, publisher_reference]));
				current.setAbortAction(true);
			}
		}
		
	} else {
		gs.addErrorMessage(gs.getMessage('Invalid table "{0}"', reference_table));
		current.setAbortAction(true);
	}
	gr.close();
}
