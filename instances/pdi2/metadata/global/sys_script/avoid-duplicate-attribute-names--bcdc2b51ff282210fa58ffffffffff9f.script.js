(function executeRule(current, previous /*null when async*/) {
	if (new SGAttributesUtil('sys_sg_descriptive_element_attribute', 'descriptive_element').isDuplicate(current)) {
			gs.addErrorMessage(gs.getMessage("Attribute '{0}' for Descriptive Element '{1}' ({2}) already exists",
			[current.name, current.descriptive_element.name, current.descriptive_element]));
			current.setAbortAction(true);
	}
})(current, previous);
