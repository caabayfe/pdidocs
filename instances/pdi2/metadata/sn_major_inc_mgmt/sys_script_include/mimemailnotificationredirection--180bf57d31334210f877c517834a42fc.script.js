var MIMEmailNotificationRedirection = Class.create();
MIMEmailNotificationRedirection.prototype = {

    MIM_WORKBENCH_URL_PREFIX: '/$major_incident_workbench.do?sysparm_stack=no&sysparm_sys_id=',
    SOW_REDIRECTION_MIM_PROPERTY: 'sn_major_inc_mgmt.sow_email_notification_redirect.mim',

    initialize: function() {},

    getRedirectionURL: function(type, params) {
        var emailRedirectAPI = new global.EmailNotificationRedirection();
        if (emailRedirectAPI.isSowRedirectionEnabled() && this._isSowRedirectionEnabledForMIM() && gs.hasRole('sn_sow.sow_user'))
            return emailRedirectAPI.getSowRecordURL(params.table, params.sysId);
        else
            return this.MIM_WORKBENCH_URL_PREFIX + params.sysId;
    },

	_isSowRedirectionEnabledForMIM: function() {
		return gs.getProperty(this.SOW_REDIRECTION_MIM_PROPERTY, 'false') == 'true';
	},

    handles: function(type) {
        return type == "mim";
    },

    type: 'MIMEmailNotificationRedirection'
};
