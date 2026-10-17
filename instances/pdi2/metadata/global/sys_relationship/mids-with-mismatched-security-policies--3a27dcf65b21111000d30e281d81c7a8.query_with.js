(function refineQuery(current, parent) {

	if(parent.policy_type != 'system_defaults') {
		current.addQuery('sys_id', '=', 'undefined');
	} else {
		var util = new  MIDSecurityPolicyCheckUtil();
		var currentMatchMids = util.getMismatchMidsWithServiceNowSecPolicy();
		
		if(Array.isArray(currentMatchMids) && !currentMatchMids.length) {
			//currentMatchMids is empty
			current.addQuery('sys_id', '=', 'undefined');
			return;
		}
		
		current.addQuery('sys_id', "IN", currentMatchMids);
		current.addQuery('status', 'Up');
	
	}

})(current, parent);
