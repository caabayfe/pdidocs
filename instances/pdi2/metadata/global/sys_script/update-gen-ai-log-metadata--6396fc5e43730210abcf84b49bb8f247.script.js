(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sys_gen_ai_log_metadata");
	gr.addQuery("gen_ai_log_id", current.getUniqueValue());
	gr.query();

	if (gr.next()) {
		for (const key in current) {
			if (key != "sys_mod_count" && gr.isValidField(key) && current[key] != previous[key]) {
				gr.setValue(key, current[key]);
			}
		}
		gr.update();
	}

})(current, previous);
