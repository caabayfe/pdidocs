var OnCallMembersByUserEmailNotificationRedirection = Class.create();
OnCallMembersByUserEmailNotificationRedirection.prototype = {

    SOW_URL_PREFIX: '/now/sow/schedules',

    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled() && new OnCallCommon().isSowRedirectionEnabledForOnCall() && gs.hasRole('sn_sow.sow_user')) {
            return this._buildMembersByUserUrlSOW(params);
        } else {
            return this._buildMembersByUserUrlUI16(params);
        }
    },

    _buildMembersByUserUrlUI16: function(params) {
        var url = new OnCallRotation().getRotaMembersByUserAndGroupURL(params.userSysId, params.groupSysId);
        return url;
    },

    _buildMembersByUserUrlSOW: function(params) {
        // Navigates to the corresponding group's SOW on-call schedule page with Shifts contextual side panel open
        var url = this.SOW_URL_PREFIX;
        if (!typeof params == "object" || !Object.keys(params).length) return url;
        url += "/params/selected-group/" + params.groupSysId;
        url += "/selected-sidebar/shifts";
        return url;
    },

    handles: function(type) {
        return type == "oc_user_members";
    },

    type: 'OnCallMembersByUserEmailNotificationRedirection'
};
