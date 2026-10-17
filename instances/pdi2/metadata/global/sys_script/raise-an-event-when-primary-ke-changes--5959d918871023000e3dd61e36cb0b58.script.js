(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue('problem.ke_associated', current,  current.primary_known_error_article, previous.primary_known_error_article);

})(current, previous);
