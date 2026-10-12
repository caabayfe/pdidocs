(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_ux_layout_bounds");
	gr.addQuery("macroponent", current.getUniqueValue());
	gr.query();

	if (gr.next()) {
		gr.setValue("bounds", JSON.stringify({}));
		gr.update();
	}

})(current, previous);
