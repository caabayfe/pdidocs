(function executeRule(current, previous /*null when async*/) {
    
	if (!current.order || current.order < 0) {
        gs.addErrorMessage(gs.getMessage('Expect a non-negative number for the order field'));
        current.order.setError(gs.getMessage('Expect a non-negative number for the order field'));
        current.setAbortAction(true);
        return;
    }
    
    var gr = new GlideRecord('sa_rca_smc_rule');
    gr.addQuery('config_id', current.config_id);
	gr.addQuery('order', current.order);
	if(current.sys_id){
		gr.addQuery('sys_id', '!=', current.sys_id);
	}
    gr.query();
	
	if(gr.next()){
		gs.addErrorMessage(gs.getMessage('Order field should be unique across the rules defined for the config'));
        current.order.setError(gs.getMessage('Order field should be unique across the rules defined for the config'));
        current.setAbortAction(true);
        return;
	}
    
})(current, previous);
