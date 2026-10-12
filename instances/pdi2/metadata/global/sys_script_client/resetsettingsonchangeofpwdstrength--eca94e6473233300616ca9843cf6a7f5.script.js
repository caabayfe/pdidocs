function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || newValue === 70) {
        return;
    }

    var utilMethodToFetchDefaults = "";

    var msg = "";
    if (newValue == 10) {
        utilMethodToFetchDefaults = 'getDefaultStrength';
        msg = getMessage('Old default password strength preset has been applied and the settings have been updated accordingly.');
    } else if (newValue == 20) {
        utilMethodToFetchDefaults = 'getMediumStrength';
        msg = getMessage('Medium password strength preset has been applied and the settings have been updated accordingly.');
    } else if (newValue == 30) {
        utilMethodToFetchDefaults = 'getHighStrength';
        msg = getMessage('High password strength preset has been applied and the settings have been updated accordingly.');
    } else if (newValue == 40) {
		utilMethodToFetchDefaults = 'getDefaultStrongStrength';
        msg = getMessage('Default strong password strength preset has been applied and the settings have been updated accordingly.');
    } else if (newValue == 50) {
        msg = getMessage('Custom password strength preset has been applied, please update the settings as required.');
    }

	// If the strength preset is other than Custom then get the default values and set accordingly 
    if (utilMethodToFetchDefaults != "") {
        var ga = new GlideAjax('PasswordPolicyUtil');
        ga.addParam('sysparm_name', utilMethodToFetchDefaults);
        ga.getXMLWait();
        var strengthDefaults = JSON.parse(ga.getAnswer());
        g_form.setValue('minimum_uppercase_characters', strengthDefaults.minimum_uppercase_characters);
        g_form.setValue('minimum_lowercase_characters', strengthDefaults.minimum_lowercase_characters);
        g_form.setValue('minimum_numeric_characters', strengthDefaults.minimum_numeric_characters);
        g_form.setValue('minimum_special_characters', strengthDefaults.minimum_special_characters);
    }

    // Update the min length.
    g_form.setValue('minimun_password_length', 8);
    g_form.showFieldMsg('password_strength', msg, 'info');
}
