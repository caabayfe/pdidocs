(function executeRule(current, previous /*null when async*/) {
    
	var problemGr = current.task.getRefRecord();
	var knownErrorGr = current.kb_knowledge.getRefRecord();
	if(problemGr.isValid() && problemGr.canWrite()) {
		problemGr.setValue("primary_known_error_article", knownErrorGr.getUniqueValue());
		problemGr.update();
		gs.addInfoMessage(gs.getMessage("Known Error article <a href='{0}'>{1}</a> attached to the Problem <a href='{2}'>{3}</a>", [knownErrorGr.getLink(), knownErrorGr.getDisplayValue(), problemGr.getLink(), problemGr.getDisplayValue()]));
	}

})(current, previous);
