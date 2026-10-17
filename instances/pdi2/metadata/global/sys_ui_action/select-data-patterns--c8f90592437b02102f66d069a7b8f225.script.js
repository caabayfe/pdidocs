function selectPolicyPatternsSlushBucket() {
    var dialog = new GlideModal('select_policy_data_patterns');
    dialog.setWidth(450);
    dialog.setTitle(new GwtMessage().getMessage('Select Data Patterns'));
    dialog.setPreference('sysparm_privacy_config_id', g_form.getUniqueValue());
	dialog.setPreference('sysparm_config_table', 'dp_configuration_domain_separated');
    dialog.setPreference('focusTrap', true);
    dialog.render();
}
