(function executeRule(current, previous /*null when async*/) {

	if (current.source_type == 'email')
		current.phone_number_source = '';
	else if (current.source_type == 'phone_number')
		current.email_source = '';

})(current, previous);
