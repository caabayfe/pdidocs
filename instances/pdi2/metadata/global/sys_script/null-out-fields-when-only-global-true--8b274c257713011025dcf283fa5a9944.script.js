(function executeRule(current, previous /*null when async*/ ) {
    var isTokenBasedAuth = isTokenBasedAuthProfile(current.sys_id);
    if (isTokenBasedAuth) {
        gs.addErrorMessage(gs.getMessage("Token Based Auth is not allowed in Global REST API Policy"));
        current.setAbortAction(true);
    }
})(current, previous);

function isTokenBasedAuthProfile(policySysID) {
    var gr = new GlideRecord('sys_auth_profile_mapping');
    gr.addQuery('api_access_policy', policySysID);
    gr.queryNoDomain();
    if (gr.next()) {
        var isTokenAuth = (gr.inbound_auth_profile.sys_class_name.equals('http_key_auth') || gr.inbound_auth_profile.sys_class_name.equals('http_hmac_auth'));
        if (isTokenAuth) {
            return true;
        }
    }
    return false;
}
