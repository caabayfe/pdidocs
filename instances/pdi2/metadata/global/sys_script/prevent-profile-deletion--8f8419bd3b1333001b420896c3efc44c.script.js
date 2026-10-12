(function executeRule(current, previous /*null when async*/) {

	var cloneRequestAgg = new GlideAggregate('clone_instance');
	cloneRequestAgg.addAggregate('COUNT');
	cloneRequestAgg.addQuery('profile', current.getValue('sys_id'));
	cloneRequestAgg.addEncodedQuery('stateINRequested,Scheduled,Active,Hold');
	cloneRequestAgg.query();
	
	if(cloneRequestAgg.next() && cloneRequestAgg.getAggregate('COUNT') != 0) {
		gs.addErrorMessage("Operation failed as profile " + current.getValue('name') + " is linked to active clones.");
		current.setAbortAction(true);
	}

})(current, previous);
