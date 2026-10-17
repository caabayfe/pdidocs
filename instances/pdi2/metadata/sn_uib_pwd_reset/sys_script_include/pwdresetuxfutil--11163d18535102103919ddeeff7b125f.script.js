var PwdResetUXFUtil = Class.create();
PwdResetUXFUtil.prototype = {
    initialize: function() {},

    validateToken: function(token) {
        if (!gs.nil(token)) {
            return new global.PwdCommonUtils().validateCSRFToken(token);
        }
        return false;
    },

    getSecurityValidationResult: function(token) {
        var result = {
            isValid: false
        };
        if (this.validateToken(token)) {
            result.isValid = true;
            return result;
        }
        result.errorMessage = gs.getMessage("Technical error has occured, try again!");
        return result;
    },

    type: 'PwdResetUXFUtil'
};
