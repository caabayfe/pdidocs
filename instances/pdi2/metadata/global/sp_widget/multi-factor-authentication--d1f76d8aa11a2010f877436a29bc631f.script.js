(function() {
    /* populate the 'data' object */
    /* e.g., data.table = $sp.getValue('table'); */

    data.webauthn_enabled = gs.getProperty('glide.webauthn.enabled', 'false') == 'true';
    data.can_disable_mfa = SNC.MultifactorAuthUtil.canDisableMultifactorAuth();
	data.has_remembered_browser = SNC.MultiFactorAuthBrowserFingerPrintUtil.hasRememberedBrowser();
    var origin = SNC.WebAuthnUtils.getOrigin();
    var totp = [];
    var grTotp = new GlideRecord('user_multifactor_auth');
    if (grTotp.isValid()) {
        grTotp.addQuery('user', gs.getUserID());
        grTotp.addQuery('is_validated', true);
        grTotp.query();
    }
    data.totp_available = grTotp.hasNext();
    while (grTotp.next()) {
        var totp_rec = {};
        totp_rec.sys_updated_on = grTotp.getValue('sys_updated_on');
        totp.push(totp_rec);
    }
    data.totp = totp;

    var platformCred = [];
    var grPlatformCred = new GlideRecord('sys_user_public_credential');
    if (grPlatformCred.isValid()) {
        grPlatformCred.addActiveQuery();
        grPlatformCred.addQuery('user', gs.getUserID());
        grPlatformCred.addQuery('type', 'platform');
        grPlatformCred.addQuery('origin', origin);
        grPlatformCred.query();
    }
    data.platformCred_available = grPlatformCred.hasNext();
    while (grPlatformCred.next()) {
        var platform_rec = {};
        platform_rec.credential_nickname = grPlatformCred.getValue('credential_nickname');
        platform_rec.registration_time = grPlatformCred.getValue('registration_time');
        platform_rec.sys_id = grPlatformCred.getUniqueValue();

        platformCred.push(platform_rec);
    }
    data.platformCred = platformCred;



    var roamingCred = [];
    var grRoamingCred = new GlideRecord('sys_user_public_credential');
    if (grRoamingCred.isValid()) {
        grRoamingCred.addActiveQuery();
        grRoamingCred.addQuery('user', gs.getUserID());
        grRoamingCred.addQuery('type', 'cross-platform');
        grRoamingCred.addQuery('origin', origin);
        grRoamingCred.query();
    }
    data.grRoamingCred_available = grRoamingCred.hasNext();
    while (grRoamingCred.next()) {
        var roaming_rec = {};
		roaming_rec.credential_nickname = grRoamingCred.getValue('credential_nickname');
        roaming_rec.registration_time = grRoamingCred.getValue('registration_time');
        roaming_rec.sys_id = grRoamingCred.getUniqueValue();
        roaming_rec.sys_updated_on = grRoamingCred.getValue('sys_updated_on');
        roamingCred.push(roaming_rec);
    }
    data.roamingCred = roamingCred;




    if (input && input.action === "remove_authenticator") {
        new WebAuthentication().removeAuthenticator(input.sysId);
        return;
    }

    if (input && input.action === "forgetAllRememberedBrowsersCall") {
        new GlideMultifactorAuthenticator().forgetAllRememberedBrowsers();
        return;
    }

    if (input && input.action === "disableMfa") {
        new GlideMultifactorAuthenticator().disableMFA();
        return;
    }

    if (input && input.action === "retrieve_authenticator") {
        var grManageCred = new GlideRecord('sys_user_public_credential');
        if (grManageCred.isValid()) {
            grManageCred.addQuery('sys_id', input.sysId);
            grManageCred.query();
        }
        while (grManageCred.next()) {
            data.web_auth_nickname = grManageCred.getValue('credential_nickname');
            data.web_auth_registration_time = grManageCred.getValue('registration_time');
            data.web_auth_last_used_time = grManageCred.getValue('last_used_time');
            data.web_auth_type = grManageCred.getValue('type');
        }
        return true;
    }

})();
