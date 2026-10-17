(function executeRule(current, previous /*null when async*/) {

	var current_total_score = current.score ? parseInt(current.score) : 0;
	var feedback_score = current.feedback_score ? parseInt(current.feedback_score) : 0;
	var previous_feedback_score = previous.feedback_score ? parseInt(previous.feedback_score) : 0;

	var new_score = current_total_score + (feedback_score - previous_feedback_score);

	if (new_score != current_total_score)
		current.setValue('score', new_score);
})(current, previous);
