(function executeRule(current, previous /*null when async*/ ) {
    var sourceGr = new GlideRecord(current.source_table);
    sourceGr.query();
    sourceGr.next();
    var evaluator = new GlideScopedEvaluator();
    evaluator.putVariable('sourceGr', sourceGr);

    function validate(script_field) {
        var res = evaluator.evaluateScript(current, script_field, null);
        if (res == null) {
            var err = evaluator.withReturnError(true).evaluateScript(current, script_field, null);
            if (err != null) {
                gs.addErrorMessage(gs.getMessage("{0} in - {1}", [err, script_field]));
                current.setAbortAction(true);
                return;
            }
        }
    }

    if (current.apply_post_fetch_filter == true)
        validate('post_fetch_filter');
    if (current.custom_name_script == true)
        validate('custom_name_script');
    if (current.custom_type_script == true)
        validate('custom_type_script');

})(current, previous);
