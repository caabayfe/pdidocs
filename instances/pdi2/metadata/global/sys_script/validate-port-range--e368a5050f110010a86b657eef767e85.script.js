(function executeRule(current, previous /*null when async*/) {

	if (current.flow == 'inbound') {
		current.ports = '';
		current.use_ports = false;
		current.use_on_mid = false;
	} else {
		if(!current.use_ports) {
			current.ports = '';
		} else {
			if( !SncIPAuthenticator.validatePortRange(current) ) {
				gs.addInfoMessage(gs.getMessage("Invalid port range."));
				current.setAbortAction(true);
			}
		}
	}

})(current, previous);
