
    (function executeRule(current, previous /*null when async*/) {
    
	switch(current.policy_type.toString()) {
		case 'system_defaults':
			if(current.operation() == 'insert') {
				rejectInsertion(current);
			}
			break;

		case 'public_network':
		case 'private_network':
			var gr = new GlideRecord('mid_cert_check_policy');
			gr.addQuery('policy_type', current.policy_type);
			gr.addQuery('sys_domain', current.sys_domain);
			gr.addQuery('sys_id', '!=', current.sys_id);

			gr.query();

			if(gr.next()) {
				rejectInsertion(current);
			}
			break;
	}

})(current, previous);

function rejectInsertion(current) {
	var type = current.policy_type;
	var domain = current.sys_domain;

	var message = "Duplicate record: type [" + type + "] under domain [" + domain + "]";
	
	gs.addErrorMessage(message);
	
	current.setAbortAction(true);
}
