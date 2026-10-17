(function executeRule(current, previous /*null when async*/) {
	//update summary
	current.summary = current.network_ip + '/' + current.netmask; 
	
	// Update the name if it was not modified by the user. 
	if (!current.name)
		current.name = current.summary; 

})(current, previous);
