(function executeRule(current, previous) {
	var type = parseInt(current.getValue('type'));
	//insert record from sharing panel
	if (!JSUtil.nil(current.getValue('identity'))) {
		processSharingPanelRecord(type, current.getValue('identity'));
	}
	//insert record from form
	else switch(type) {
		case 1: processFormRecord(type, current.getValue('role')); 	
				break;
		case 2: processFormRecord(type, current.getValue('group'));
				break;
		case 3: processFormRecord(type, current.getValue('user'));
				break;
	}
})(current, previous);


function processSharingPanelRecord(type, identity) {
	switch(type) {
		case 1:
			var record = new GlideRecord('sys_user_role');
			record.get('name', identity);
			current.setValue('role', record.getUniqueValue());
			break;
		case 2:
			current.setValue('group', identity);
			break;
		case 3:
			current.setValue('user', identity);
			break;
	}
}

function processFormRecord(type, sysId) {
	switch(type) {
		case 1:
			var record = new GlideRecord('sys_user_role');
			record.get(sysId);
			current.setValue('identity', record.getValue('name'));
			break;
		case 2:
			current.setValue('identity', sysId);
			break;
		case 3:
			current.setValue('identity', sysId);
			break;
	}
}
