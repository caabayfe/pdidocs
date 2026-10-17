(function generateDescription(current, previous) {
	var varRecord = current.parameters.getVariablesRecord();
	var varNames = current.parameters.getVariableNames();
	var descriptionStrings = [];
	for (var i = 0; i < varNames.length; i++) {
		var ge = varRecord.getElement(""+varNames[i]);
		var value = ge.getDisplayValue();
		descriptionStrings.push(ge.getLabel() + " = " + value);
	}
	
	var table = current.sys_class_name;
	var td = GlideTableDescriptor.get(table);
	var elementDescriptors = td.getSchemaList();
	for (var i = 0; i < elementDescriptors.size(); i++) {
		var ed = elementDescriptors.get(i);
		var name = ed.getName();
		if (sn_atf.ATFParametersUtil.isValidSharedParameterName(name))
			descriptionStrings.push(ed.getLabel() + " = " + current.getDisplayValue(name));

	}
	current.description = descriptionStrings.join("\n");
})(current, previous);
