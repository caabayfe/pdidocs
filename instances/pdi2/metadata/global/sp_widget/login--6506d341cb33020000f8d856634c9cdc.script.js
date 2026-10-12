(function() {
    options.show_panel = options.show_panel == "true" || options.show_panel == true;

    if (input && input.action === "multi_factor_auth_setup") {
        if (gs.getSession().getProperty("setup_multifactor_authn")) {
            if (input.directTo && input.directTo != "/login_cpw.do") {
              gs.getSession().putProperty("nav_to", input.directTo);
              gs.getSession().putProperty("starting_page", input.directTo);
            }
            gs.getSession().putProperty("is_direct_redirect", "true");
        }
        return;
    }
    var portalRecord = $sp.getPortalRecord();
    var idpList = [];
    data.isMultiSSOActive = gs.getProperty('glide.authenticate.multisso.enabled', 'false') == 'true';

    if (data.isMultiSSOActive) {
        data.portal_authentication_mode = $sp.getValue("enable_portal_authentication") == 'true';
        data.use_local_login = $sp.getValue("enable_local_login") == 'true';
        var portalIdentityProviders = $sp.getValue('portal_identity_providers');
        if (data.portal_authentication_mode && portalIdentityProviders) {
            var arr = portalIdentityProviders.split(',');
            for (var i = 0; i < arr.length; i++) {
                var val = arr[i];
                if (val) idpList.push(val.trim() + "");
            }
        }
    }


    var ssoSelectorField = gs.getProperty('glide.authenticate.multisso.login_locate.user_field', 'user_name');
    var td = new GlideTableDescriptor('sys_user');
    var ed = td.getElementDescriptor(ssoSelectorField);
    if (ed)
        data.ssoSelectorFieldLabel = ed.getLabel();


    // We don't want to set a starting page until we've begun the login process.
    if (input && input.action === "set_sso_destination") {
        var gs_nav_to = gs.getSession().getProperty("nav_to");
        gs.getSession().putProperty("nav_to", null);

        if (input.pageURI) {
            gs.getSession().putProperty("is_direct_redirect", "true");
            gs.getSession().putProperty("starting_page", input.pageURI);
        } else if (!gs.getSession().getProperty("starting_page") && gs_nav_to)
            gs.getSession().putProperty("starting_page", gs_nav_to);
        return;

    }

    // for self registration fields
    var self_registration_field = portalRecord ? portalRecord.getValue("user_registration_config") : "";
    if (self_registration_field) {
        var registration_config = new GlideRecord("sys_user_registration_config");
        registration_config.addActiveQuery();
        registration_config.query('sys_id', self_registration_field);
        if (registration_config.next()) {
            var self_registration_record_producer = registration_config.getValue("record_producer");
            var self_registration_label = registration_config.getDisplayValue("registration_label") || gs.getMessage("Sign Up");
            data.self_registration_record_producer = self_registration_record_producer;
            data.self_registration_label = self_registration_label;
        }
    }

    //Enabling certificate based authentication per portal
    if (portalRecord && (portalRecord.getValue('enable_certificate_based_authentication') == 1))
        data.cert_based_auth = gs.getProperty('glide.authenticate.mutual.enabled', 'false') == 'true';
    
    //get the certificate header
    if (data.cert_based_auth) {
	var request = GlideTransaction.get().getRequest();
	var certHeader = request.getHeader("X-Client-Cert");
	if (!certHeader) {
		data.certHeader = "false";
            gs.log("Failed to register PIV/CAC certificate to the user account.");
        } else
		data.certHeader = "true";    
    }

    //Get the OpenID Connect and SAML type Identity provider which can be shown on the Portal login page.
    data.isShowLoginWithIdps = false;
    data.isMultiSSOActive = gs.getProperty('glide.authenticate.multisso.enabled', 'false') == 'true';
    var ssoRecords = [];
    data.ssoRecords = [];

    var gr = new GlideRecord("sso_properties");
    if (data.isMultiSSOActive && gr.isValid()) {
        ssoRecords = new MultiSSO_OidcUtil().getSSORecords();
    }

    if (!data.portal_authentication_mode) {
        data.ssoRecords = ssoRecords;
    } else if (idpList.length > 0) {
        for (var i = 0; i < ssoRecords.length; i++) {
            var idp = ssoRecords[i];
            if (idpList.indexOf(idp.sysId.trim()) !== -1)
                data.ssoRecords.push(idp);
        }
    }
    data.isShowLoginWithIdps = (data.ssoRecords.length > 0);

    //STRY50033370: Forgot Password link in the login widget
    data.pswdResetUrl = gs.getProperty('glide.security.password_reset.uri');
    data.forgotPwdLinkProp = gs.getProperty('glide.security.forgot_password.display.link');

    data.errorMsg = gs.getMessage("There was an error processing your request");
    data.errorMsg2 = gs.getMessage("An error has occurred - please contact your system administrator");
    data.passwordMsg = gs.getMessage("Password");
    data.usernameMsg = gs.getMessage("User name");
    data.forgetMe = GlideProperties.getBoolean("glide.ui.forgetme");
    data.rememberMeDefault = GlideProperties.getBoolean('glide.ui.remember.me.default', true);
    data.is_logged_in = gs.getSession().isLoggedIn();
    var bypass_sso = options.bypass_sso == "true";
    data.multisso_enabled = !bypass_sso && GlideProperties.getBoolean("glide.authenticate.multisso.enabled");
    data.default_idp = GlideProperties.get("glide.authenticate.sso.redirect.idp");
    data.pageURI = new GlideSPUtil().getPageUri();
    data.multiFactorAuthEnabled = GlideProperties.getBoolean('glide.authenticate.multifactor', false);
    data.certAuthRedirect = gs.getProperty('glide.authenticate.cert.redirect.enable', 'false') == 'true';
    if (data.portal_authentication_mode && data.use_local_login)
        data.default_idp = null;
    if (data.portal_authentication_mode && data.ssoRecords.length > 0) {
        if (data.ssoRecords.length == 1)
            data.default_idp = data.ssoRecords[0].sysId;
        else if (data.ssoRecords.length > 1)
            data.default_idp = null;

    }

    //STRY53144967: Handle user redirection to specific Identity provider mapped in Custom Url record for Portals
    var customURL = GlideProperties.getBoolean('glide.customurl.enabled', false);
    if (customURL == true && data.multisso_enabled == true) {
		var idp = SNC.CustomURLSPUtil.getAutoRedirectIDPForCustomURLWithPortal();
		if(GlideStringUtil.notNil(idp))
			data.default_idp = idp;
    }
	
	//Show info message is session access is reduced
    var isSessionAccessReduced = GlideSession.get().getBooleanProperty("isSessionAccessReduced", false);
    var isSessionAccessMessageShown = GlideSession.get().getBooleanProperty("isSessionAccessReducedMessageShown", false);
    if (isSessionAccessReduced && !isSessionAccessMessageShown)
        SNC.SessionAccessUtil.showUserInfoMessageIfAccessReduced();
})();
