if (current.category.metric_type != current.assessment_record.metric_type) {
	gs.addErrorMessage(gs.getMessage('You can only assess categories of the {0} type on this record.',  current.assessment_record.metric_type.name));
	current.setAbortAction(true);
} else if (current.category.qb_evaluation_method) {
	gs.addErrorMessage(gs.getMessage('You cannot assess categories of Question Bank'));
	current.setAbortAction(true);
}
