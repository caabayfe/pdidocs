(function executeRule(current, previous /*null when async*/) {
	if (current.attributes != "")
		current.attributes += ",";
	
	current.attributes += "element_mapping_provider=com.glide.decision_table.data.DecisionTableVariableMapper"
	// Add your code here

})(current, previous);
