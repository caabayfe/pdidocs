function onLoad() {
   // If this is an on demand item, hide stakeholder list
	var metricType = g_form.getReference('metric_type');
   if (metricType && metricType.schedule_type != 'scheduled')
   	g_form.hideRelatedList("asmt_m2m_stakeholder");
}
