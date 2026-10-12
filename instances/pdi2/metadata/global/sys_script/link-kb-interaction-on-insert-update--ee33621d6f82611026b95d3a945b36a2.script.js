(function executeRule(current, previous /*null when async*/) {
	var operation = current.operation();

	var opName = operation == "insert" ? "Created" : "Updated";
	new InteractionRelationshipUtil().linkToParentInteraction(current, opName);
})(current, previous);
