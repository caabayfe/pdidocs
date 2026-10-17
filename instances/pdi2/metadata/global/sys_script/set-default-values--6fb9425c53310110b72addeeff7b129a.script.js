(function executeRule(current, previous /*null when async*/) {
	
	current.root_token = current.subject.root_token;
	if (!current.parameter.nil())
		current.name = current.parameter.name;

})(current, previous);
