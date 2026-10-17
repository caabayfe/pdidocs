function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '')
        g_form.setVisible('integration_type', false);
    else {
        var entityProfile = g_form.getReference("oauth_entity_profile");
        if (entityProfile.grant_type == "password" || entityProfile.grant_type == "authorization_code") {
            g_form.setVisible('integration_type', true);
        } else
            g_form.setVisible('integration_type', false);
    }
    if (oldValue != newValue)
        g_form.setValue("integration_type", "system");
}
