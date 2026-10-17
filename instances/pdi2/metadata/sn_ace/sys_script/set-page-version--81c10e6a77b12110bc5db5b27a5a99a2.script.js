(function executeRule(current, previous /*null when async*/) {

	if(current.template && current.template.version)
		current.version = current.template.version;
	else 
		current.version = '';

})(current, previous);
