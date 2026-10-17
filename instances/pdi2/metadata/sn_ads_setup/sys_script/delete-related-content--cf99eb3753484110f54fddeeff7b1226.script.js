(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("help_content");
		gr.addEncodedQuery("sys_idIN" + current.related_content, true);
		gr.query();
		gr.deleteMultiple();
})(current, previous);
