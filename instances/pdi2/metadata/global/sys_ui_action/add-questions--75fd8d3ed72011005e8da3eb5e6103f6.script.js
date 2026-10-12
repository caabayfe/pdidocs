current.insert(); // force business rule "Create Survey Records" to update additional fields
action.setRedirectURL("asmt_metric_category.do?sys_id=" + getMetricCategoryId(current.sys_id) + "&sysparm_view=survey");

function getMetricCategoryId(metricTypeId) {
	var metricCategoryRecord = new GlideRecord('asmt_metric_category');
	metricCategoryRecord.addQuery('metric_type', metricTypeId);
	metricCategoryRecord.query();
	
	if (metricCategoryRecord.next())
		return metricCategoryRecord.sys_id;
	
	return "";
}
