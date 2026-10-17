var OnCallApprovalEmailNotificationRedirection = Class.create();
OnCallApprovalEmailNotificationRedirection.prototype = {

    SOW_ON_CALL_CAL_URL_PREFIX: '/now/sow/schedules',
    UI_16_APPROVAL_RECORD_URL_PREFIX: 'sysapproval_approver.do?sys_id=',

    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled() && new OnCallCommon().isSowRedirectionEnabledForOnCall() && gs.hasRole('sn_sow.sow_user')) {
            return this._buildApprovalRequestUrlSOW(params);
        } else {
            return this._buildApprovalRequestUrlUI16(params);
        }
    },

    _buildApprovalRequestUrlUI16: function(params) {
        var approvalSysId = params.approval_sys_id;
        var url = this.UI_16_APPROVAL_RECORD_URL_PREFIX;
        if (approvalSysId) url += approvalSysId;
        return url;
    },

    _buildApprovalRequestUrlSOW: function(params) {
        // Navigates to the corresponding group's SOW on-call schedule page with Reqired actions contextual side panel open
        var url = this.SOW_ON_CALL_CAL_URL_PREFIX;
        if (!typeof params == "object" || !Object.keys(params).length) return url;
        url += "/params/selected-view/WEEK/selected-sidebar/requested-actions";
        if (params.group) url += "/selected-group/" + params.group;
        if (params["context_date"]) url += "/selected-date/" + (new GlideDateTime(params["context_date"]).getNumericValue());
        return url;
    },

    handles: function(type) {
        return type == "oc_approval";
    },

    type: 'OnCallApprovalEmailNotificationRedirection'
};
