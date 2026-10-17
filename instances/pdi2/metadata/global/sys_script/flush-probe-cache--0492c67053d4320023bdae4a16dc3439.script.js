(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("discovery_probe_results_cache");
	gr.query();
	gr.deleteMultiple();

})(current, previous);
