(function process(env) {
	var uiRuleId = env.getSource()['sys_id']['value'];
	var gr = new GlideRecord('sys_sg_ui_rule_action');
	gr.query("ui_rule", uiRuleId);
	
	return gr;
})(env);
