(function executeRule(current, previous /*null when async*/) {

	if(current.answer == true)
		current.weighted_score = current.question.weight || 0;
	else
		current.weighted_score = 0;
	current.setWorkflow(false);
	current.update();
	current.setWorkflow(true);

})(current, previous);
