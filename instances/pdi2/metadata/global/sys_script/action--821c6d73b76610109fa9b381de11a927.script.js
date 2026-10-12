(function executeRule(current, previous /*null when async*/ ) {
	var type = null;
	var actions = new GlideRecord('ais_rule_action');
	actions.addQuery("rule", current.sys_id);
	actions.query();
	if (actions.next()) {
		type = actions.type;
	}
    if (type != null && type.toString().length > 0) {
        g_scratchpad.rule_action_type = type.getValue();
    } else {
        g_scratchpad.rule_action_type = null;
    }
})(current, previous);
