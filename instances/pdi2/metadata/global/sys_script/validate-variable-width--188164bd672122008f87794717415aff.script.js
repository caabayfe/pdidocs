(function executeRule(current, previous /*null when async*/) {
	var variableTypes = {
				'12' : 'Break',
				'14' : 'Macro',
				'15' : 'UI Page',
				'17' : 'Macro with Label',
				'19' : 'Container Start',
				'20' : 'Container End',
				'21' : 'List Collector',
				'23' : 'HTML',
				'24' : 'Container Split',
				'28' : 'IP',
				};
	
	var type = current.type;
	var width = current.variable_width;
	var msgArray = [variableTypes[type], width];
	
	if (type == '14' || type == '15' || type == '17' || type == '21' || type == '23') {
		if (width == '25')
			invalidWidthBlocker();
	}
	else if (type == '28' && (width == '75' || width == '100' ))
		invalidWidthBlocker();
	
	else if (type == '12' || type == '19' || type == '20' || type == '24') {
		if (width != '') 
			invalidWidthBlocker();
	}
	
	function invalidWidthBlocker() {
		var msg = gs.getMessage("{1}% width option not supported for {0} variable", msgArray);
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}

	})(current, previous);
