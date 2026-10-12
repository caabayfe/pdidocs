var EmailNotificationRedirectionSNC = Class.create();
EmailNotificationRedirectionSNC.prototype = {

    SOW_REDIRECTION_PROP: 'sow_email_notification_redirect',
    BASE_URL: gs.getProperty('glide.servlet.uri'),
    SOW_RECORD_URL_PREFIX: 'now/sow/record/',
    UI_PAGE_URL: 'itsm_email_notification_redirect.do?',

    getLink: function(table, sysId, type, params) {
        if (!type) {
            type = "record";
            params = {
                table: table,
                sysId: sysId
            };
        }
        params = encodeURIComponent(JSON.stringify(params));
        return this.UI_PAGE_URL + 'sysparm_table=' + table + '&sysparm_sysId=' + sysId + '&sysparm_type=' + type + '&sysparm_param=' + params;
    },

    getRedirectionURL: function(table, sysId, type, params) {
        if (!type) {
            type = "record";
            params = {
                table: table,
                sysId: sysId
            };
        }
        return this._getExtensionPointRedirectionURL(type, params);
    },

    _getExtensionPointRedirectionURL: function(type, params) {
        var url;
        var eps = new GlideScriptedExtensionPoint().getExtensions("global.ITSMEmailNotificationRedirection");
        for (var i = 0; i < eps.length; i++) {
            if (eps[i].handles(type)) {
                url = eps[i].getRedirectionURL(type, params);
                break;
            }
        }
        return url;
    },

    isSowRedirectionEnabled: function(table) {
        if (!table)
            return gs.getProperty(this.SOW_REDIRECTION_PROP) == 'true';
        else {
            if (gs.getProperty(this.SOW_REDIRECTION_PROP) == 'true')
                return gs.getProperty(this.SOW_REDIRECTION_PROP + '.' + table, 'true');
            else
                return gs.getProperty(this.SOW_REDIRECTION_PROP + '.' + table, 'false');

        }
    },

    getSowRecordURL: function(table, sysId) {
        return this.BASE_URL + this.SOW_RECORD_URL_PREFIX + table + '/' + sysId;
    },

    getUI16RecordURL: function(table, sysId) {
        return this.BASE_URL + table + '.do?sys_id=' + sysId;
    },

    type: 'EmailNotificationRedirectionSNC'
};
