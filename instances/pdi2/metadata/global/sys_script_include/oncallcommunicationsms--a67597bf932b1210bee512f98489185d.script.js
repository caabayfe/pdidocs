var OnCallCommunicationSMS = Class.create();
OnCallCommunicationSMS.prototype = {
    initialize: function() {},

    handle: function(type) {
        if (type == OnCallCommonSNC.COMMUNICATION_TYPES.SMS) return true;
        return false;
    },

    getCommunicationTypeLabel: function() {
        return gs.getMessage('SMS');
    },

    isValidPreference: function(pref) {
        return pref.type == new OnCallConstants().COMMUNICATION_CHANNEL.SMS && pref.number;
    },

    isChannelPluginInstalled: function() {
        return new OnCallWorkflowUtils().isNotifyPluginInstalled();
    },

    checkContactSourceType: function(contactSourceGr) {
        if (contactSourceGr.getValue("source_type") === 'phone_number') return true;
        return false;
    },

    setPreferenceFromContactSource: function(preference, contactSourceGr, sourceTableGr) {
        preference.number = sourceTableGr.getValue(contactSourceGr.getValue('phone_number_source'));
    },

    setCommunicationGrForCommunicationChannel: function(communicationGr, commType, commValue) {
        communicationGr.addQuery('phone_number', commValue);
    },

    setRecordForCommunicationDetail: function(gr, commType, commValue) {
        gr.setValue('phone_number', commValue);
    },

    setUserPreferencesForCommunicationChannel: function(communicationTypes, userContactPreferenceGr, userSysId) {
        var smsPreferences = [];
        if (communicationTypes.indexOf(new OnCallConstants().COMMUNICATION_CHANNEL.SMS) !== -1) {
            var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
            if (onCallContactPreferenceUtil.isNotifyInstalled) {
                smsPreferences = onCallContactPreferenceUtil._getSMSPreferencesInUserContactPreference(userContactPreferenceGr, userSysId);
            }
        }
        return smsPreferences;
    },

    setUserPreferenceFromSource: function(preferences, preference, type, sourceTableGr, contactSourceGr, fieldName, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        fieldName = contactSourceGr.getValue('phone_number_source');
        if (fieldName) {
            if ((!checkAccess ||  sourceTableGr[fieldName] && sourceTableGr[fieldName].canRead())) {
                preference['number'] = sourceTableGr.getValue(fieldName);
            } else {
                preference['number'] = '';
            }
        } else
            this._log.logError('[_getPreferencesFromSources] fieldName: ' + fieldName + ' must be valid field on table: ' + sourceTableGr.getTableName());

        preferences.push(preference);
    },

    setDeviceType: function(deviceTypes, commType) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        deviceTypes.push(onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.SMS);
    },

    checkNotifyDeviceType: function(notifyDeviceType) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (notifyDeviceType === onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.SMS) return true;
        return false;
    },

    setDevicePreference: function(preference, notifyDeviceGr, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (onCallContactPreferenceUtil.isNotifyInstalled) {
            preference.type = OnCallCommonSNC.COMMUNICATION_TYPES.SMS;
            var formattedSMSNumber = onCallContactPreferenceUtil._getGlideElementPhoneNumber(notifyDeviceGr.getValue('phone_number'));
            preference.number = (!checkAccess ||  notifyDeviceGr.phone_number.canRead()) && formattedSMSNumber ? formattedSMSNumber.getValue() : '';
        }
    },

    getDefaultChannel: function(userSysId) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (onCallContactPreferenceUtil.isNotifyInstalled && onCallContactPreferenceUtil._checkIfUserHasNumber(userSysId, OnCallCommonSNC.COMMUNICATION_TYPES.SMS))
            return [OnCallCommonSNC.COMMUNICATION_TYPES.SMS];
    },

    setDefaultEscalateePreferences: function(commType, escalateeSysId, preferences) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (onCallContactPreferenceUtil.isNotifyInstalled) {
            var numbers = onCallContactPreferenceUtil.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [escalateeSysId], [], commType);
            preferences.push({
                type: commType,
                number: numbers[0] || ''
            });
        }
    },

    checkPreferenceType: function(preference) {
        if (preference == OnCallCommonSNC.COMMUNICATION_TYPES.SMS) return true;
        return false;
    },

    setUserContactDetailsByPreferences: function(userContact, preference, userContactDetails, checkAccess) {
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (onCallContactPreferenceUtil.isNotifyInstalled) {
			onCallContactPreferenceUtil.setCheckAccess(checkAccess);
            var numbers = onCallContactPreferenceUtil.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userContact.sys_id], [], preference);
            userContactDetails.push({
                type: preference,
                number: numbers[0] || ''
            });
        }
    },

    type: 'OnCallCommunicationSMS'
};
