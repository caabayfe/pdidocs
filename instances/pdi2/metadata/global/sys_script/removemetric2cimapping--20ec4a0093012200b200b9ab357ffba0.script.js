(function executeRule(current, previous /*null when async*/) {

	// on de activation of the metric go over all metric2ci records and remove them
	if (!current.active) {

		var gr = new GlideRecord("sa_metric_map");

		gr.addQuery("metric_type_id.source_metric_type", current.getUniqueValue());
		gr.query();

		gs.log("RemoveMetric2CiMapping for metric type '" + 
			   current.source_metric_type + "': " + gr.getRowCount() + " of metric map rows will be removed.");
		gr.deleteMultiple();
	}

})(current, previous);
