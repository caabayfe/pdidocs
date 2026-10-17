answer = (function() {
	var ac = new SNC.AssessmentCreation();
	if (ac.isGuestUserTakingPublicSurvey(current.sys_id, gs.getUserID()))
		return true;
	var gr = new GlideRecord('asmt_assessment_instance');
	gr.addQuery('metric_type', current.sys_id);
	gr.addQuery('user', gs.getUserID());
	gr.addQuery('state', 'IN', 'ready,wip,complete');
	gr.setLimit(1);
	gr.query();
	return gr.hasNext();
})();
