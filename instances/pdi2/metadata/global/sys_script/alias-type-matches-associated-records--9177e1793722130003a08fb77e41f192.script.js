(function executeRule(current, previous /*null when async*/) {
	var gr;
	
	if (current.type == 'connection') {
		gr = new GlideRecord('discovery_credentials');
		gr.addEncodedQuery('tagLIKE' + current.getUniqueValue());
		gr.addActiveQuery();
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Error: cannot change alias type to connection because it references credential(s)'));
			current.setAbortAction(true);
		}
	} else if (current.type == 'credential') {
		gr = new GlideRecord('sys_connection');
		gr.addQuery('connection_alias', current.getUniqueValue());
		gr.addActiveQuery();
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage('Error: cannot change alias type to credential because it references connection(s)'));
			current.setAbortAction(true);
		}
	}

})(current, previous);
