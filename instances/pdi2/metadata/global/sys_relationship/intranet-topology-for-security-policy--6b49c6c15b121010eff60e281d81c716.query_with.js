(function refineQuery(current, parent) {

	if(parent.policy_type != 'private_network') {
		current.addQuery('sys_id', '=', 'undefined');
	} else {
		current.addQuery('sys_domain', '=', parent.sys_domain);
	}

})(current, parent);
