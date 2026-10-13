(function executeRule(current, previous /*null when async*/ ) {

    if (previous.outgoing_connections != current.outgoing_connections ||
        previous.ci_type != current.ci_type) {
		
        current.config_set = '1';
    }

    var gr = new GlideRecord('em_ci_graph_reuse');
    gr.addQuery('alert_ci.sys_class_name', current.ci_type);
    gr.query();

    gr.deleteMultiple();

    var learnedGr = new GlideRecord('em_cmdb_learned_connected_cis');
    learnedGr.addQuery('cmdb_ci.sys_class_name', current.ci_type);
    learnedGr.query();

    learnedGr.deleteMultiple();

})(current, previous);
