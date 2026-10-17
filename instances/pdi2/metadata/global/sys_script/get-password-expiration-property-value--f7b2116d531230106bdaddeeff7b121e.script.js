(function executeRule(current, previous /*null when async*/ ) {
    var credStoreTypeSysId = current.cred_store.type;
    var credStoreTypeGr = new GlideRecord("pwd_cred_store_type");
    credStoreTypeGr.get(credStoreTypeSysId);

    g_scratchpad.isPasswordExpirationFeatureEnabled = gs.getProperty('pwd_reset.enable.password_expiration_reminder', 'false') === 'true';

    g_scratchpad.isPasswordExpirationSubflowMapped = credStoreTypeGr.getValue("pwd_expiration_details_flow") ? true : false;
})(current, previous);
