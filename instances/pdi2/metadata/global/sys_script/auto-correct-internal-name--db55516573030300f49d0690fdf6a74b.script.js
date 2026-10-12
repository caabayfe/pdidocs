(function executeRule(current, previous /*null when async*/) {

	// Auto-correct the internal name. Throw a message if the chosen value != oldValue
	var oldName = current.getValue("internal_name");
	current.internal_name = SNC.TableEditor.getValidElementName(oldName, "");
})(current, previous);
