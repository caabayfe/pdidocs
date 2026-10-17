(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('cmdb_model');
	gr.get(current.model);
	gr.product_catalog_item = "";
	gr.update();
})(current, previous);
