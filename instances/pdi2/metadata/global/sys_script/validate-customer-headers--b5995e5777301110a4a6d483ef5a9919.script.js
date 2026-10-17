(function executeRule(current, previous /*null when async*/) {

	//HTTP Response Headers should only have letters and a hyphen.
	var validName = RegExp(/^(([A-Za-z0-9]+-?)*[A-Za-z0-9]+)*$|^([A-Za-z0-9]+)$/g);
	
	if(!validName.test(current.header_name)) {
		current.header_name.setError(gs.getMessage("HTTP Headers can only contain text and '-'. No spaces or _ are permitted."));
		gs.info("HTTP Headers can only contain text and '-'. No spaces or _ are permitted.");
		current.setAbortAction(true);
	}

})(current, previous);
