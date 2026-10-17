gs.include("PrototypeServer");

var Login = Class.create();
Login.prototype = {
    initialize : function() {
    },

    process : function() {
        // the request is passed in as a global
        var userName = request.getParameter("user_name");
        var userPassword = request.getParameter("user_password");
        
        var user = GlideUser;
        if (GlideStringUtil.notNil(userName)) {
            var authed = user.authenticate(userName, userPassword);
            if (authed)
                return user.getUser(userName);
        } else if (SNC.AuthenticationHelper.isMutualAuth()) {
            var userLoginName = user.authenticateMutualAuthToken();
            if (userLoginName != null) {
                return user.getUser(userLoginName);
            }
        }
        this.loginFailed();

        return "login.failed";
    },

    loginFailed: function() {
        if (GlideController.exists("glide.ldap.error.connection")) {
            var ldapConnError = GlideController.getGlobal("glide.ldap.error.connection");
            if (GlideStringUtil.notNil(ldapConnError))
                GlideSession.get().addErrorMessage(ldapConnError);
        } else if (request.getSession().getAttribute("glide.authenticate.local.login.method") == "certificate") {
            var message = GlideSysMessage.format("cert_login_invalid");
            GlideSession.get().addErrorMessage(message);
        } else if (GlideController.exists("glide.auth.policy.ui.error.message")) {
            var authPolicyError = GlideController.getGlobal("glide.auth.policy.ui.error.message");
            if (GlideStringUtil.notNil(authPolicyError)) {
                GlideSession.get().addErrorMessage(GlideSysMessage.format(authPolicyError));
            }
        } else {
            var message = GlideSysMessage.format("login_invalid");
            GlideSession.get().addErrorMessage(message);
        }

    }

}
