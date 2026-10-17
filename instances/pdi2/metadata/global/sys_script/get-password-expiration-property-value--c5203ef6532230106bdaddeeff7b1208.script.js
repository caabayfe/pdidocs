(function executeRule(current, previous /*null when async*/ ) {
    g_scratchpad.isPasswordExpirationFeatureEnabled = gs.getProperty('pwd_reset.enable.password_expiration_reminder', false);
})(current, previous);
