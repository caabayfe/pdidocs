(function executeRule(current, previous /*null when async*/) { 
	
	current.order = current.cleanup_script.order;
	current.active = current.cleanup_script.active;
	
})(current, previous);
