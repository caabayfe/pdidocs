var OnCallCommunicationConferenceEscalation = Class.create();
OnCallCommunicationConferenceEscalation.prototype = {
    initialize: function() {},

    handle: function(type) {
        if (type == OnCallCommonSNC.COMMUNICATION_TYPES.CONFERENCE_ESCALATION) return true;
        return false;
    },

    getCommunicationTypeLabel: function() {

    },

    isValidPreference: function(pref) {

    },

    isChannelPluginInstalled: function() {

    },

    setPreferenceFromContactSource: function(preference, contactSourceGr, sourceTableGr) {},

    setCommunicationGrForCommunicationChannel: function(communicationGr, commType, commValue) {
        communicationGr.addQuery("user", commValue);
    },

    setRecordForCommunicationDetail: function(gr, commType, commValue) {

    },

    setUserPreferencesForCommunicationChannel: function(communicationTypes, userContactPreferenceGr, userSysId) {

    },

    setUserPreferenceFromSource: function(preferences, preference, type, sourceTableGr, contactSourceGr, fieldName) {

    },

    setDeviceType: function(deviceTypes, commType) {

    },

    checkNotifyDeviceType: function(notifyDeviceType) {

    },

    setDevicePreference: function(preference, notifyDeviceGr) {

    },

    getDefaultChannel: function(type, userSysId) {

    },

    setDefaultEscalateePreferences: function(type, escalateeSysId, preferences) {
        preferences.push({
            type: OnCallCommonSNC.COMMUNICATION_TYPES.CONFERENCE_ESCALATION,
            conference_escalation: OnCallCommonSNC.COMMUNICATION_TYPE_LABELS.CONFERENCE_ESCALATION
        });
    },

    checkPreferenceType: function(preference) {

    },

    setUserContactDetailsByPreferences: function(userContact, preference, userContactDetails) {

    },


    type: 'OnCallCommunicationConferenceEscalation'
};
