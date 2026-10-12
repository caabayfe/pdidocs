(function executeRule(current, previous /*null when async*/) {

		if(current.servicenow) {
			current.sys_policy = 'read';
		} else {
			current.sys_policy = '';
		}

	})(current, previous);
