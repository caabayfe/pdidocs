var actions = new GlideRecord('catalog_ui_policy_action');
actions.query();
while (actions.next()) {
	var variable = actions.catalog_variable.getDisplayValue().split("IO:")[1];
	if (!variable)
		variable = actions.catalog_variable.split("IO:")[1];
	var option = new GlideRecord('item_option_new');
	if (option.get(variable)) {
		actions.variable = option.name;
	} else {
		option = new GlideRecord("item_option_new_set");
		if (option.get(variable))
			actions.variable = option.internal_name;
	}
	actions.update();
}
gs.setProperty("glide.sc.policy.update_action_names", false);
