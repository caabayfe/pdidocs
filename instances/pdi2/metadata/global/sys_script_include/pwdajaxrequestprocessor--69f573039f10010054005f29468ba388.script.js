var PwdAjaxRequestProcessor = Class.create();
PwdAjaxRequestProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    /**
     * Tests if the security is good enough.
     */
    _validateSecurity: function() {
        var token = this.getParameter("sysparam_pwd_csrf_token");
        //check if there's any csrf violation or not.
        //now, we have only csrf validation.
        var result = new global.PwdCommonUtils().validateCSRFToken(token);
        if (!result) {
            var msg = gs.getMessage('Security violation');
            this._setSecurityResponseMessage('error', msg, '');
            return false;
        }

        // if csrf violation didn't get detected, then set response attributes and return.
        this._setSecurityResponseMessage('ok', '', token);
        return true;
    },



    /**
     * Sets a security response and send it back.
     */
    _setSecurityResponseMessage: function(status, msg, token) {

        var response = this.newItem("security");
        response.setAttribute("status", status);
        response.setAttribute("message", msg);
        response.setAttribute("pwd_csrf_token", token);
    },

    _setResponseMessage: function(status, msg, value) {
        var response = this.newItem("response");
        response.setAttribute("status", status);
        response.setAttribute("message", msg);
        response.setAttribute("value", value);
    },

    getCsrfToken: function() {
        return this.getParameter("sysparam_pwd_csrf_token");
    }
});
