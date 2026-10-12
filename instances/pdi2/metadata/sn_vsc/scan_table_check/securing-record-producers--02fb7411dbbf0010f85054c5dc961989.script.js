(function(finding, current) {
	var gr = new GlideRecord("sc_cat_item_user_criteria_mtom");
	var id = current.getValue("sys_id");
	gr.addQuery('sc_cat_item', id);
	gr.addNotNullQuery('user_criteria');
	gr.query();
	if (!gr.next()) {
		finding.setCurrentSource(current);
		finding.increment();
	}
})(finding, current);
