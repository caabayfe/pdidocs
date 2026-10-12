(function executeRule(current, previous /*null when async*/) {

	current.timeout = GlideStringUtil.parseLong(current.timeout);
	
	if(current.timeout < 10000) {
		gs.addInfoMessage(gs.getMessage("Timeout value must be more than 10000 ms. Setting it to default value 120000 ms"));
		current.timeout = 120000;
	}
})(current, previous);
