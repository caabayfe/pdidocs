(function executeRule(current, previous /*null when async*/) {
	var previous_decision = previous.model;
	var max_inputs = parseInt(gs.getProperty('com.glide.decision_table.max_inputs'));
	if(!gs.nil(max_inputs)) {
		var num_current_inputs = 0;
		var count_current_inputs = new GlideAggregate('sys_decision_input');
		count_current_inputs.addAggregate('COUNT');
		count_current_inputs.addQuery('model',current.model);
		count_current_inputs.query();
		if(count_current_inputs.next()) {  
			num_current_inputs = parseInt(count_current_inputs.getAggregate('COUNT'));
			if (num_current_inputs >= max_inputs) {
			gs.addInfoMessage(gs.getMessage('Only {0} max inputs can be associated with a Model record',max_inputs));
			current.setAbortAction(true);
			}
		}
	}
})(current, previous);
