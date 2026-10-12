answer = (function() {
	if (current.isNewRecord())
		return true;
	
	if ((current.category.metric_type.survey_owners+"").indexOf(gs.getUserID()) !== -1)
		return true;
	
	var gr = new GlideRecord('asmt_assessment_instance');
	gr.addQuery('metric_type', current.category.metric_type+"");
	gr.addQuery('user', gs.getUserID());
	gr.addQuery('state', 'IN', 'ready,wip,complete');
	gr.setLimit(1);
	gr.query();
	if (gr.hasNext())
		return true;
	
	return false;
})();
