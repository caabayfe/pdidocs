(function executeRule(current, previous /*undefined when async or display*/) {

	if (current.proposal_type == 1) {
		current.template_name = current.short_description;
	} else if (current.proposal_type == 2) {
		if(current.std_change_producer) {
			current.template_name = current.std_change_producer.name;
		}
	}

})(current, typeof previous != 'undefined' ?  previous : null);
