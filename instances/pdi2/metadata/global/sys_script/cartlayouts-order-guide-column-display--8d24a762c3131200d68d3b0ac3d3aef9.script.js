(function executeRule(current, previous /*null when async*/) {

	var layoutGr = new GlideRecordSecure("sc_layout");
	layoutGr.query();
	while (layoutGr.next()) {
		layoutGr.setValue('sc_order_guide_column', current.getValue('value'));
		layoutGr.update();
	}

})(current, previous);
