function onLoad() {
	if (g_form.getBooleanValue('function_field') && g_user.hasRoleExactly('function_field_admin') && !g_user.hasRoleExactly('admin')) {
		g_form.setDisabled('function_definition', true);
		g_form.setDisabled('reference', true);
		g_form.setDisabled('use_reference_qualifier', true);
		g_form.setDisabled('reference_qual_condition', true);
		g_form.setDisabled('dynamic_ref_qual', true);
		g_form.setDisabled('reference_qual', true);
		g_form.setDisabled('reference_key', true);
		g_form.setDisabled('reference_cascade_rule', true);
		g_form.setDisabled('dynamic_creation', true);
		g_form.setDisabled('dynamic_creation_script', true);
		g_form.setDisabled('reference_floats', true);
	}
}
