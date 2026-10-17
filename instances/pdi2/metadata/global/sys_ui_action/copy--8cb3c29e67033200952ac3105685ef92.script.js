cloneSurvey();
function cloneSurvey() {
	
	new CloneSurvey().cloneMetricType(current);
	
	var metricTypeName = GlideStringUtil.escapeHTML(current.getDisplayValue('name'));
	var infoMessage = gs.getMessage('{0} has been created',metricTypeName);
	
	gs.addInfoMessage(infoMessage);
}
