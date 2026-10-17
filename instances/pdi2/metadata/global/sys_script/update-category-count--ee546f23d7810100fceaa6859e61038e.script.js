updateCount();

function updateCount() {
	var gr_metric = new GlideRecord("asmt_metric");
	gr_metric.addQuery("category", current.category);
	gr_metric.query();
	
	var count = gr_metric.getRowCount();
	var gr_cat = new GlideRecord("asmt_metric_category");
	gr_cat.get(current.category);
	if (gr_cat.isValidRecord()) {
		gr_cat.total_metrics = count;
		gr_cat.update();
	}
}
