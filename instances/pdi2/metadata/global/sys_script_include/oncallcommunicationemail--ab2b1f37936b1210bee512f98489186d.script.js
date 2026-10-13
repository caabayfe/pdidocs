var OnCallCommunicationEmail = Class.create();
OnCallCommunicationEmail.prototype = {
    initialize: function() {},

    handle: function(type) {
        if (type == OnCallCommonSNC.COMMUNICATION_TYPES.EMAIL) return true;
        return false;
    },

    getCommunicationTypeLabel: function() {
        return gs.getMessage('E-mail');
    },

    isValidPreference: function(pref) {
        return pref.type == new OnCallConstants().COMMUNICATION_CHANNEL.EMAIL && pref.email;
    },

    isChannelPluginInstalled: function() {
        return true; //No plugin check needed for email
    },

    checkContactSourceType: function(contactSourceGr) {
        if (contactSourceGr.getValue('source_type') === OnCallCommonSNC.COMMUNICATION_TYPES.EMAIL) return true;
        return false;
    },

    setPreferenceFromContactSource: function(preference, contactSourceGr, sourceTableGr) {
        preference.email = sourceTableGr.getValue(contactSourceGr.getValue('email_source'));
    },

    setCommunicationGrForCommunicationChannel: function(communicationGr, commType, commValue) {
        communicationGr.addQuery(commType, commValue);
    },

    setRecordForCommunicationDetail: function(gr, commType, commValue) {
        gr.setValue(commType, commValue);
    },

    setUserPreferencesForCommunicationChannel: function(communicationTypes, userContactPreferenceGr, userSysId) {
        var emailPreferences = [];
        if (communicationTypes.indexOf(new OnCallConstants().COMMUNICATION_CHANNEL.EMAIL) !== -1) {
            var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
            emailPreferences = onCallContactPreferenceUtil._getEmailPreferencesInUserContactPreference(userContactPreferenceGr, userSysId);
        }
        return emailPreferences;
    },

    setUserPreferenceFromSource: function(preferences, preference, type, sourceTableGr, contactSourceGr, fieldName, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        fieldName = contactSourceGr.getValue('email_source');
        if (fieldName) {
            if ((!checkAccess ||  sourceTableGr[fieldName] && sourceTableGr[fieldName].canRead())) {
                preference[type] = sourceTableGr.getValue(fieldName);
            } else {
                preference[type] = "";
            }
        } else
            this._log.logError('[_getPreferencesFromSources] fieldName: ' + fieldName + ' must be valid field on table: ' + sourceTableGr.getTableName());

        preferences.push(preference);
    },

    setDeviceType: function(deviceTypes, commType) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        deviceTypes.push(onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.EMAIL);
    },

    checkNotifyDeviceType: function(notifyDeviceType) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (notifyDeviceType === onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.EMAIL) return true;
        return false;
    },

    setDevicePreference: function(preference, notifyDeviceGr, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        preference.type = OnCallCommonSNC.COMMUNICATION_TYPES.EMAIL;
        preference.email = (!checkAccess ||  notifyDeviceGr.email_address.canRead()) ? notifyDeviceGr.getValue('email_address') : '';
    },

    getDefaultChannel: function(userSysId) {
        return [OnCallCommonSNC.COMMUNICATION_TYPES.EMAIL];
    },

    setDefaultEscalateePreferences: function(commType, escalateeSysId, preferences, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
		if(!checkAccess){
        	preferences.push({
            	type: commType,
            	email: onCallContactPreferenceUtil._getUserEmailAddress(escalateeSysId, checkAccess)
        	});
		}
    },

    checkPreferenceType: function(preference) {
        if (preference == OnCallCommonSNC.COMMUNICATION_TYPES.EMAIL) return true;
        return false;
    },

    setUserContactDetailsByPreferences: function(userContact, preference, userContactDetails, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        userContactDetails.push({
            type: preference,
            email: onCallContactPreferenceUtil._getUserEmailAddress(userContact.sys_id, checkAccess)
        });
    },

    type: 'OnCallCommunicationEmail'
};
