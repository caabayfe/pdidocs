function onLoad() {
	// If the "Type" field is on the form check that this is a Standard change
	if (g_form.hasField("type") && g_form.getValue("type") !== "standard")
		return;

	// If we haven't got "standardChange.readOnlyFields" properties on the scratchpad then this was not a "standard" change when the form was loaded
	if (!g_scratchpad.hasOwnProperty("standardChange") || !g_scratchpad.standardChange.hasOwnProperty("readOnlyFields"))
		return;

	// Now get the read only field names from the sratchpad and confirm it is an array
	var readOnlyFields = g_scratchpad.standardChange.readOnlyFields;
	if (!Array.isArray(readOnlyFields))
		return;

	// Set each field read only if it is present on the form
	readOnlyFields.forEach(function(fieldName) {
		if (g_form.hasField(fieldName))
			g_form.setReadOnly(fieldName, true);
	});
}

// Function is not used within this Client Script. It will remain to ensure we don't affect customers who may be using it.
function markReadonly(answer){
	if(answer){
		var parsedAttributeNames = answer.split(',');
		for(var i = 0; i < parsedAttributeNames.length; i++){
			if(g_form.hasField(parsedAttributeNames[i]))
				g_form.setReadOnly(parsedAttributeNames[i], true);
		}
	}
}
