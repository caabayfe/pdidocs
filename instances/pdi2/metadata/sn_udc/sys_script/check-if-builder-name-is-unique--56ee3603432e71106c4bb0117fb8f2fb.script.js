(function executeRule(current, previous /*null when async*/) {
	var currentName = current.getValue('name');
	var gr = new GlideRecord('sn_udc_file_taxonomy_builder');
	gr.addQuery('name', currentName);
	gr.query();
	if (gr.getRowCount() > 0 && gr.next() && gr.getUniqueValue() != current.getUniqueValue()) {
		gs.addInfoMessage(gs.getMessage('Builder name must be unique'));
		current.setAbortAction(true);
	}
})(current, previous);
