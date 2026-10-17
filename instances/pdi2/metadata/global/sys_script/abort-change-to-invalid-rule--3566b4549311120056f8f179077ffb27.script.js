(function executeRule(current, previous /*null when async*/) {

	if (current.impact_rule.applies_to_element_type == "CI"  || current.impact_rule.applies_to_element_type == "INCLUSION"
	   || current.impact_rule.applies_to_element_type == "CLUSTER") {
		current.setAbortAction(true);
	}
	

})(current, previous);
