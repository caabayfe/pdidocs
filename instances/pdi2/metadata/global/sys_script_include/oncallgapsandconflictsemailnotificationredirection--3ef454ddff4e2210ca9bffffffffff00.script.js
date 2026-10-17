var OnCallGapsAndConflictsEmailNotificationRedirection = Class.create();
OnCallGapsAndConflictsEmailNotificationRedirection.prototype = {

    SOW_URL_PREFIX: '/now/sow/schedules',
    UI16_URL_PREFIX: '/$oc_workbench.do',

    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled() && new OnCallCommon().isSowRedirectionEnabledForOnCall() && gs.hasRole('sn_sow.sow_user')) {
            return this._buildGapsAndConflictsUrlSOW(params);
        } else {
            return this._buildGapsAndConflictsUrlUI16(params);
        }
    },

    _buildGapsAndConflictsUrlUI16: function(params) {
        var url = this.UI16_URL_PREFIX;
        if (!typeof params == "object" || !params.hasOwnProperty('groupId')) return url;
        url += "?sysparm_group_id=" + params.groupId;
        return url;
    },

    _buildGapsAndConflictsUrlSOW: function(params) {
        // Navigates to the group's SOW on-call schedule page with Required Actions contextual side panel open
        var url = this.SOW_URL_PREFIX;
        if (!typeof params == "object" || !params.hasOwnProperty('groupId')) return url;
        url += "/params/selected-group/" + params.groupId;
        url += "/selected-sidebar/requested-actions/selected-view/WEEK";
        return url;
    },

    handles: function(type) {
        return type == "oc_gaps_conflicts";
    },

    type: 'OnCallGapsAndConflictsEmailNotificationRedirection'
};
