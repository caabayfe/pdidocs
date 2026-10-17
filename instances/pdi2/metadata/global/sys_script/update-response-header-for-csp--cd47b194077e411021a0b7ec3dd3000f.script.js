(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord("sys_response_header");
	gr.addQuery("sys_id","2457d59d07a2c11021a0b7ec3dd30000");
	gr.addQuery("applies_to","all_pages");
	gr.query();

	if (gr.next()) {
		if (current.value == "true" || current.value == "True") {
			gr.active = true;
		} else {
			gr.active = false;
		}
		gr.update();
	}

})(current, previous);
