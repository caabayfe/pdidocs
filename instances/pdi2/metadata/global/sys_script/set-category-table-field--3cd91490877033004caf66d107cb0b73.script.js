(function executeRule(current, previous /*null when async*/) {
	// Update its categories' "table" field when "table" field on metric_type form gets changed
	var newTable = current.getValue("table");
	var metricTypeId = current.getUniqueValue();
	
	var grMetricCategory = new GlideRecord("asmt_metric_category");
	grMetricCategory.addQuery("metric_type", metricTypeId);
	grMetricCategory.query();
	while (grMetricCategory.next()) {
		grMetricCategory.setValue("table", newTable);
		grMetricCategory.update();
	}

})(current, previous);
