function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var currentGroup;
	g_scratchpad._lockDisplayField = true;
	
	if (isLoading) {
		currentGroup = g_scratchpad._loadDisplayField;
		delete g_scratchpad._loadDisplayField;
	}
	else
		currentGroup = g_form.getValue('display_field').toString();
	
	g_form.clearOptions('display_field');
	if (newValue == '' && !isLoading) {
		delete g_scratchpad._lockDisplayField;
		return;
	}
	
	// Get all of the columns available from the selected table
	var list = new Array();
	var ga = new GlideAjax('AssessmentUtilsAJAX');
	ga.addParam('sysparm_name', 'getTableFields');
	ga.addParam('sysparm_filter_table', newValue);
	ga.setErrorCallback(function(req, args) {
		delete g_scratchpad._lockDisplayField;
	});
	ga.getXML(ajaxDisplayFieldResponse, [], [newValue, currentGroup]);
}
	
function ajaxDisplayFieldResponse(serverResponse, params) {
	try {
		var newValue = params[0];
		var currentGroup = params[1];
		var results = serverResponse.responseXML.getElementsByTagName("result");
		
		var matchFound = false;
		
		var referenceFields = {};
		if(results!=null && results.length>0)
		{
			g_form.addOption('display_field',"none" , getMessage("-- None --"));
		}
		for (var i = 0; i < results.length; i++) {
			var value = results[i].getAttribute('value');
			var label = results[i].getAttribute('label');
			var display = results[i].getAttribute('display');
			var referenceKey = results[i].getAttribute('referenceKey');
			var reference = results[i].getAttribute('reference');
			
			// Add each column as a possible group field
			if (value != '') {
				g_form.addOption('display_field', value ,label);
				if (value == currentGroup)
					matchFound = true;
			}
			// If this column is a reference field, take note
			if (referenceKey)
				referenceFields[value] = referenceKey;
			else if (reference)
				referenceFields[value] = reference;
		}
		
		if (matchFound)
			g_form.setValue('display_field', currentGroup);
		else
			currentGroup = g_form.getValue('display_field').toString();
		g_scratchpad._groupReferenceFields = referenceFields;
	} 
	catch(e) {
		
	}
	delete g_scratchpad._lockDisplayField;
	g_form.setValue('display_field', currentGroup);
}
