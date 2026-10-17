(function generateDescription() {
	var description = gs.getMessage("Set the reusable output variables for the test as follows:") + "\n";;
    var varRecord = step.callable_outputs.getVariablesRecord();
	var varNames = step.callable_outputs.getVariableNames();
	var descriptionStrings = [];
	for (var i = 0; i < varNames.length; i++) {
		var ge = varRecord.getElement(""+varNames[i]);
		var value = ge.getDisplayValue();
		descriptionStrings.push(ge.getLabel() + " = " + value);
	}
	return description += descriptionStrings.join("\n");
})(step);
