(function process(/*ResolverEnvironment*/ env) {
	var gr = new GlideRecordSecure('sys_pd_activity_start_rule_definition');
	gr.addQuery('sys_scope', 'global');
	gr.addQuery('active', true);
	gr.addQuery('sys_id', '!=', '7abaf173c35101102a86cb03b940dd62'); // after_activities start rule
    gr.query();

    return gr;
})(env);
