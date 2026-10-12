(function executeRule(current, previous /*null when async*/) {
	// Check if the related article is the same as the knowledge article
if (current.related_kb_knowledge == current.kb_knowledge) {
    // Abort the action and display an error message
    gs.addErrorMessage(gs.getMessage("You cannot associate the same article as a related article. Please pick a different article."));
    current.setAbortAction(true);
}
})(current, previous);
