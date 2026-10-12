function onCondition() {
    var isPasswordExpirationFeatureEnabled = g_scratchpad.isPasswordExpirationFeatureEnabled === "true";
    g_form.setDisplay("pwd_expiration_details_flow", isPasswordExpirationFeatureEnabled);
}
