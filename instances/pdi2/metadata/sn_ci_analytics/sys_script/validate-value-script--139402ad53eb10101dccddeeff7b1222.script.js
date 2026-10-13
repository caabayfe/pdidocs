(function executeRule(current, previous /*null when async*/ ) {
    var sourceGr = new GlideRecord(current.source_table);
    sourceGr.query();
    sourceGr.next();
    var evaluator = new GlideScopedEvaluator();
	evaluator.putVariable('sourceGr', sourceGr);
    var res = evaluator.evaluateScript(current, 'value_script', null);
	if (res == null) {
		var err = evaluator.withReturnError(true).evaluateScript(current, 'value_script', null);
		if (err != null) {
			gs.addErrorMessage(err);
			current.setAbortAction(true);
		}
	}
})(current, previous);
