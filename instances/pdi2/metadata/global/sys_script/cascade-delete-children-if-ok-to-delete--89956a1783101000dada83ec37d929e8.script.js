performChange();

function performChange() {
	// Prevent deletion of built-in directory
	// ef89e4fc372001006b882d465abe5d60 is powershell
	var id = '' + current.getUniqueValue();
	if (id == 'ef89e4fc372001006b882d465abe5d60') {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This built-in directory should not be updated or deleted."));		
		return;
	}
	
	var gr = new GlideRecord('ecc_agent_sync_file');
	gr.addQuery('parent', id);
	gr.query();
	while (gr.next())
	   gr.deleteRecord();
}
