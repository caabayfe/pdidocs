(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var tabset = current.getValue('parent');
	var gr = new GlideRecord('sn_ace_content_block');
	gr.addQuery('active', true);
	gr.addQuery('parent', tabset);
	gr.query();
	if(gr.getRowCount() >= 15 && gr.canRead()) {
		gs.addErrorMessage(gs.getMessage('Maximum 15 tabs allowed per Tabset'));
		current.setAbortAction(true);
		return false;
	}
	return true;

})(current, previous);
