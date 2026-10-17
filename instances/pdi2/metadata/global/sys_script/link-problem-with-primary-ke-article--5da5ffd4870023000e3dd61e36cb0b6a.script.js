(function executeRule(current, previous) {

	var problemGr = new GlideRecord("problem");
	problemGr.get(current.source);
	if(problemGr) {
		problemGr.setValue("primary_known_error_article", current.getUniqueValue());
		problemGr.update();
	}
	gs.addInfoMessage(gs.getMessage("Known Error article <a href='{0}'>{1}</a> created", [current.getLink(), current.getDisplayValue()]));

})(current, previous);
