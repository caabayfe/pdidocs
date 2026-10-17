(function executeRule(current, previous /*null when async*/) {
	var existing = new GlideRecord("interaction_related_record");
	existing.addQuery("document_id", current.document_id);
	existing.addQuery("interaction", current.interaction);
	existing.setLimit(1);
	existing.query();

	if (!existing.next()) {	
		return;
	}
	//Operations in increasing order of priority.
	var operationPriority = {Viewed: 1, Mentioned: 2, Updated: 3, Created: 4};

	//Get current operation and its priority.
	var currentOperation = current.getValue('operation');
	var currentOprPriority = operationPriority[currentOperation] || 0;

	//Get existing operation and its priority.
	var existingOperation = existing.getValue('operation');
	var existingOprPriority = operationPriority[existingOperation] || 0;

	//If existing operation is null OR current operation priority is higher than existing operation, update it.
	if(!existingOperation || (currentOprPriority > existingOprPriority)) {
		existing.operation = currentOperation;
		existing.update();
	}

	current.setAbortAction(true);
	return;	

})(current, previous);
