(function executeRule(current, previous /*null when async*/) {
	if (current.isActionAborted())
		return;

	var definition = current.getElement("trigger_definition").getRefRecord();
	
	if (definition.isValidRecord()) {
		var element = current.getElement("trigger_inputs");
		var names = element.getVariableNames();
		var source = definition.getElement("trigger_inputs");
		var varGR = element.getVariablesRecord();
		for (var i = 0; i < names.length; i++) {
			varGR.setValue(names[i], source.getVariableValue(names[i]));
		}
		
		varGR.update();
	}
})(current, previous);
