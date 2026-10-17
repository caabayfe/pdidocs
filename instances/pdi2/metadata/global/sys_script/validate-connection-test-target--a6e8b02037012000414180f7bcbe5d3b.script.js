validateTarget();

function validateTarget() {
	var hasDatabase = !gs.nil(current.target_database);
	var hasInstance = !gs.nil(current.target_instance);

    if (hasDatabase && hasInstance) {
    	gs.addErrorMessage('Target must be either an HA Database or ServiceNow Instance (only one can be chosen).');
  	current.setAbortAction(true);
        return;
    }

    if (hasDatabase == false && hasInstance == false) {
    	gs.addErrorMessage('Target must be either an HA Database or ServiceNow Instance (one must be chosen).');
  	current.setAbortAction(true);
        return;
    }
}
