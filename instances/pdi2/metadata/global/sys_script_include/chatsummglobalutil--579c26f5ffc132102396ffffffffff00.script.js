var ChatSummGlobalUtil = Class.create();
ChatSummGlobalUtil.prototype = {
    initialize: function() {},

    impersonateUser: function(userId) {
        var sessionUserId = gs.getUserID();
        var shouldImpersonate = userId !== sessionUserId;
        if (shouldImpersonate) {
            var gi = new GlideImpersonate();
            gi.impersonate(userId);
            return sessionUserId;
        }
        return null;
    },

    endImpersonation: function(userId) {
        if (gs.nil(userId))
            return;

        var gi = new GlideImpersonate();
        gi.impersonate(userId);
    },

    type: 'ChatSummGlobalUtil'
};
