(function process(/*ResolverEnvironment*/ env) {

	var gr = new GlideRecordSecure('sys_playbook_experience_activity_ui');
    gr.addQuery('sys_id', env.getSource());
    gr.query();

	return gr;
})(env);
