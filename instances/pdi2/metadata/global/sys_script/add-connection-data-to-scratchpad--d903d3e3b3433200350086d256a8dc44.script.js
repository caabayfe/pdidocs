(function executeRule(current, previous /*null when async*/) {
	
	var connectionMap =
	{
		'credential_id': '',
		'sys_class_name': '',
		'host':'',
		'port':''
	};
	
	var connectionData = {};		
	for (var field in connectionMap) {
		var value = current.getValue(field);
		if (JSUtil.nil(value))
			continue;
			
		connectionData[field] = value;
	}
		
	g_scratchpad.connectionData = connectionData;		
})(current, previous);
