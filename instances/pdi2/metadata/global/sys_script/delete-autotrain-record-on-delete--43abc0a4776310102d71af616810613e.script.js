(function executeRule(current, previous /*null when async*/) {

	var autotrainGr = new GlideRecord("ais_relevancy_autotrain_solution");
	autotrainGr.addQuery("solution_definition", current.getUniqueValue());
	autotrainGr.query();
	autotrainGr.deleteMultiple();

})(current, previous);
