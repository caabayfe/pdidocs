(function executeRule(current, previous /*null when async*/) {
	if (current.subcategory == 'condition') {
        current.short_description = "Creates an alert when a record in '" + current.getDisplayValue('table') + "' meets the condition: " + current.condition;
	}
	else {
		current.short_description = "Creates an alert for " + current.getDisplayValue('subcategory');
	}

})(current, previous);
