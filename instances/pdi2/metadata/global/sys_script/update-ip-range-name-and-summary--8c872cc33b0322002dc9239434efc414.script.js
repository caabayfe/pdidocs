(function executeRule(current, previous /*null when async*/) {
	//update summary
	current.summary = current.start_ip + '-' + current.end_ip; 
	
	// Update the name if it was not modified by the user. 
	if (!current.name)
		current.name = current.summary; 

})(current, previous);
