function isOrderValid(current) {
	var order = current.getValue('order');
	if (!order)
		return true;
    
    return order > 0;
}

(function executeRule(current, previous) {
	if (!isOrderValid(current)) {
		gs.addErrorMessage(gs.getMessage('Order must be empty or greater than 0.'));
		current.setAbortAction(true);	
	}
})(current, previous);
