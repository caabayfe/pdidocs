(function process(/*ResolverEnvironment*/ env) {
	var nameId = env.getSource();
	var gr = new GlideRecordSecure('sys_sg_view_element_attribute_name');
	gr.query("sys_id", nameId);

	return gr;
})(env);
