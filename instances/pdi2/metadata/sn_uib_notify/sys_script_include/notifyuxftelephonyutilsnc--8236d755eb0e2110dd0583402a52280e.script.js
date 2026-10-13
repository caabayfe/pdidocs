var NotifyUXFTelephonyUtilSNC = Class.create();
NotifyUXFTelephonyUtilSNC.prototype = {
    initialize: function() {
        this.notifyUtil = new global.NotifyUtil();
    },
    NOTIFY_UIB_VISIBILITY_HANDLER: "sn_uib_notify.NotifyUIBVisibility",
    sendSms: function(smsData) {
        var notifyAjaxProcessor = new global.NotifyOnTaskAjaxProcessor_V2(undefined, undefined, undefined, smsData);
        var result = {};
        try {
            result = notifyAjaxProcessor.sendSms();
        } catch (e) {
            result.status = false;
            result.errorMessages = [e.message];
        }
        return result;
    },
    canViewSendSMS: function(table, sysId) {
        var releaseVersion = gs.getProperty('itsm_family_release_version_check', 0);
        if (releaseVersion == 0 && table === 'interaction')
            return false;
        var sourceGr = new GlideRecord(table);
        if (!sourceGr.get(sysId) || !this.notifyUtil.isConferenceLeader(sourceGr))
            return false;
        if (!this.notifyUtil.canAccessSendSms(sourceGr))
            return false;
        var exPointImplementations = new GlideScriptedExtensionPoint().getExtensions(this.NOTIFY_UIB_VISIBILITY_HANDLER);
        if (exPointImplementations) {
            for (i = 0; i < exPointImplementations.length; i++) {
                var handler = exPointImplementations[i];
                if (typeof handler.canShowSendSMS === 'function' && handler.canShowSendSMS(sysId, table)) {
                    return true;
                }
            }
        }
        return false;
    },
    type: 'NotifyUXFTelephonyUtilSNC'
};
