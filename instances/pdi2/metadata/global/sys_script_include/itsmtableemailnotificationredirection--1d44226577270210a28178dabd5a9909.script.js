var ITSMTableEmailNotificationRedirection = Class.create();
ITSMTableEmailNotificationRedirection.prototype = {
    BASE_URL: gs.getProperty('glide.servlet.uri'),
    SOW_RECORD_URL_PREFIX: 'now/sow/record/',
    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled(params.table) == 'true' && gs.hasRole('sn_sow.sow_user'))
            return emailRedirectAPI.getSowRecordURL(params.table, params.sysId);
        else
            return emailRedirectAPI.getUI16RecordURL(params.table, params.sysId);
    },

    handles: function(type) {
        return type == "record";
    },

    type: 'ITSMTableEmailNotificationRedirection'
};
