(function executeRule(current, previous /*null when async*/) {

	var layout = new GlideRecord('sc_layout');
	layout.addQuery("target","order_item");
	layout.query();
	if (layout.next()) {
		layout.setValue('sc_order_item_button', false);
		layout.update();
	}

})(current, previous);
