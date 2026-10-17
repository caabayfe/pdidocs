(function executeRule(current, previous /*null when async*/ ) {
    var evaluator = new GlideScopedEvaluator();
    var gr = new GlideRecord('sn_vsc_security_check_configurations');
    gr.addQuery('config_name', 'CONTAINS', current.name.toString());
    gr.query();
    while (gr.next()) {
        evaluator.evaluateScript(gr, 'config_evaluation_script', null); //execute script and set if dependency is compliant
    }

})(current, previous);
