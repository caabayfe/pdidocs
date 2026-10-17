var RegistrationKeyService = Class.create();
RegistrationKeyService.prototype = {
    initialize: function() {
        this.regKeyManager = new sn_mid_infra.RegistrationKeyManager();
    },

    createKey: function(assignedToUserSysId, validityInMinutes) {
        return this.regKeyManager.createKey(assignedToUserSysId, validityInMinutes);
    },

    revokeKey: function(keySysId) {
        return this.regKeyManager.revokeKey(keySysId);
    },

    getValidityConfig: function() {
        return this.regKeyManager.getValidityConfig();
    },

    type: 'RegistrationKeyService'
};
