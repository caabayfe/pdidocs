(function executeRule(current, previous /*null when async*/) {
    
	// Hack to make it work for only local service now credential store type
	if (current.getValue('type') != 'e611433fbf020100710071a7bf073921') {
		return;
	}
	
	var gr = new GlideRecord('pwd_cred_store_param');
	gr.addQuery('cred_store', current.getUniqueValue());
	gr.addQuery('name', 'password_history_limit');
	gr.query();
	
	if (gr.next() && (current.enforce_history_policy == false)) {
		// A case where the enforce history policy was toggled
		gr.deleteRecord();
		
		// Delete all the users who's passwords have been stored in the history table
		var historyGr = new GlideRecord('pwd_history');
		historyGr.addQuery('credential_store', current.getUniqueValue());
		historyGr.query();
		historyGr.deleteMultiple();
	}

})(current, previous);
