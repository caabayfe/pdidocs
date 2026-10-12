function onLoad() {
	var editableFieldsMap = g_scratchpad.versioning.editableFieldsMap;
	if(!editableFieldsMap)
		return;
	if(typeof g_form.getEditableFields !== "function" ) return;
	var fields = g_form.getEditableFields();
	for (var x = 0; x < fields.length; x++) {
		if(!editableFieldsMap.hasOwnProperty(fields[x]))
			g_form.setReadOnly(fields[x], true);
	}
   
}
