function onLoad() {
   // If this is an on demand item and not a survey, hide category users list
	var metricType = g_form.getReference('metric_type');
	if (!metricType) {
		var lookupCat = new GlideRecord("asmt_metric_category");
		lookupCat.get(g_form.getUniqueValue());
		if (lookupCat.metric_type) {
			metricType = new GlideRecord("asmt_metric_type");
			metricType.get(lookupCat.metric_type);
		}
	}
	if (metricType) {
		if (metricType.schedule_type != 'scheduled' && metricType.evaluation_method == 'assessment')
   		g_form.hideRelatedList("asmt_m2m_category_user");
   	if (metricType.evaluation_method == 'survey' || metricType.evaluation_method == 'attestation' || metricType.evaluation_method == 'quiz'  || metricType.evaluation_method == 'testplan')
   		g_form.hideRelatedList("asmt_m2m_category_assessment");
	}
}
