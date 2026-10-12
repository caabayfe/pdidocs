(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_pd_lane_start_rule_definition');
	gr.addQuery('sys_scope', 'global');
	gr.addQuery('active', true);
	gr.addQuery('sys_id', '!=', 'ada8160ec3202010f5bfea1c8d40ddbd'); // manual start rule
    gr.query();

    return gr;
})(env);
