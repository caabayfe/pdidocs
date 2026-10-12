(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addInfoMessage(
		gs.getMessage(
			'This template will replace "{0}" when published.',
			current.previous_sttrm_template.getDisplayValue()
		)
	);
})(current, previous);
