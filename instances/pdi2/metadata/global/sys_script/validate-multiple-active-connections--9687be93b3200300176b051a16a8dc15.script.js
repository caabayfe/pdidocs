(function executeRule(current, previous /*null when async*/) {
	if(current.multiple_connections!=previous.multiple_connections){
		// Query for multiple active connections
		var connections = new GlideAggregate('sys_connection');
		connections.addQuery('connection_alias', current.sys_id);
		connections.addActiveQuery();
		connections.groupBy("sys_domain");
		connections.addAggregate('COUNT');
		connections.query();
		while(connections.next()){
			if(connections.getAggregate('COUNT')>1){
                                var msg = gs.getMessage("Multiple active connections found for Alias in domain: {0}. De-activate appropriate connections before disabling support.", connections.getDisplayValue('sys_domain'));
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return false;
			}
		}
	}
})(current, previous);
