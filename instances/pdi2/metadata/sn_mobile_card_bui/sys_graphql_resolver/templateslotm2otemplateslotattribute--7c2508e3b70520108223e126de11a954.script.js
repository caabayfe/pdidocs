(function process(/*ResolverEnvironment*/ env) {
    var templateSlotId = env.getSource();
	var gr = new GlideRecordSecure('sys_sg_view_template_slot');
	gr.query("sys_id", templateSlotId);

	return gr;

})(env);
