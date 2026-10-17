(function executeRule(current, previous /*null when async*/ ) {
	
    current.sys_domain = gs.getUser().getDomainID();
	
})(current, previous);
