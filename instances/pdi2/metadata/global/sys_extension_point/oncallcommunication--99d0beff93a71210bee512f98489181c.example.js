var OnCallCommunication = Class.create();
OnCallCommunication.prototype = {
    initialize: function() {},

    /*
        should return true if it matches with custom channel 
    */

    handle: function(type) {

    },

    //Returns the communication type label. Example: 'E-mail' is returned for email
    getCommunicationTypeLabel: function() {

    },

    /* Returns true if preference is valid. Example: True is returned if number is present for SMS. Structure for SMS pref object - {"number":"+91XXXXXXXXXX","type":"sms"} */
    isValidPreference: function(pref) {

    },

    //Checks if channel specific plugins are installed and returns true/false. This is an extra safe check
    isChannelPluginInstalled: function() {

    },

    /*
        check if type is matched 
    */

    checkContactSourceType: function(contactSourceGr) {

    },

    /*
        if the custom channel is added on the sys_on_call_contact source
        then preference can be set for that particular contact source 
        
        example: 
        if (contactSourceGr.getValue("source_type") === OnCallCommonSNC.COMMUNICATION_TYPES.SLACK){
            preference.email = sourceTableGr.getValue(contactSourceGr.getValue('email_source'));
        }
        In same way can be set for desired custom channel 
        sourceTableGr : sys_user record
        contactSourceGr : sys_on_call_contact record 
        NOTE: For custom channels make sure that an extra attribute type is added
        Example (Let's suppose the name of custom channel is custom and the value of source_type is email)
        preference.type = 'custom';
        preference.custom = sourceTableGr.getValue(contactSourceGr.getValue('email_source'));
    */

    setPreferenceFromContactSource: function(preference, contactSourceGr, sourceTableGr) {

    },

    /*
        use to add query for custom channel communication type on on_call_escalation_comm table 
        example : 
        if (commType == this.COMMUNICATION_TYPE.EMAIL || commType == this.COMMUNICATION_TYPE.SLACK){
            communicationGr.addQuery(this.COMMUNICATION_TYPE.EMAIL, commValue);
        }
    */

    setCommunicationGrForCommunicationChannel: function(communicationGr, commType, commValue) {

    },

    /*
        In the log Escalation communication , for creating the communication detail it is used ,
        user can set value for custom channel 
        example:
        if (commType == this.COMMUNICATION_TYPE.SMS || commType == this.COMMUNICATION_TYPE.VOICE || serviceProvider == "Telephony"){
            gr.setValue('phone_number', commValue);
        }
    */

    setRecordForCommunicationDetail: function(gr, commType, commValue) {

    },

    /*
        can use to get custom communciation type user preferences 
        example:
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        var emailPreferences = onCallContactPreferenceUtil._getEmailPreferencesInUserContactPreference(userContactPreferenceGr, userSysId);
        userPreferences = userPreferences.push(emailPreferences);
    */

    setUserPreferencesForCommunicationChannel: function(communicationTypes, userPreferences, userContactPreferenceGr, userSysId) {

    },

    /*
        contactSourceGr : SYS_ON_CALL_CONTACT_SOURCE,
        sourceTableGr: SYS_USER,
        from contact source get the required one like email or phone 
        and update the preference and push into preferences 
        e.g 
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        fieldName = contactSourceGr.getValue('email_source');
        if (fieldName) {
            if ((!onCallContactPreferenceUtil.checkAccess || sourceTableGr[fieldName] && sourceTableGr[fieldName].canRead())) {
                preference[type] = sourceTableGr.getValue(fieldName);
            } else {
                preference[type] = "";
            }
        } else
            this._log.logError('[_getPreferencesFromSources] fieldName: ' + fieldName + ' must be valid field on table: ' + sourceTableGr.getTableName());

        preferences.push(preference);
    */

    setUserPreferenceFromSource: function(preferences, preference, type, sourceTableGr, contactSourceGr, fieldName, checkAccess) {

    },

    /*
        used to set device type 
        example:
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        deviceTypes.push(onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.EMAIL);
    */

    setDeviceType: function(deviceTypes, commType) {

    },

    /*
        check check if notif device type is matched 
    */

    checkNotifyDeviceType: function(notifyDeviceType) {

    },

    /*
        used to set device preference
        example:
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (notifyDeviceType === onCallContactPreferenceUtil.CMN_NOTIFY_DEVICE_TYPES.EMAIL) {
            preference.type = type;
            preference.email = (!onCallContactPreferenceUtil.checkAccess || notifyDeviceGr.email_address.canRead()) ? notifyDeviceGr.getValue('email_address') : '';
        }
    */

    setDevicePreference: function(preference, notifyDeviceGr, checkAccess) {

    },

    /*
        fetch default channel 
        e.g 
        return [type];
    */

    getDefaultChannel: function(userSysId) {

    },

    /*
        used to set default escalation preference
        example:
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        preferences.push({
            type: commType,
            email: onCallContactPreferenceUtil._getUserEmailAddress(escalateeSysId)
        });
    */

    setDefaultEscalateePreferences: function(type, escalateeSysId, preferences, checkAccess) {

    },

    /*
        check for preference type
    */

    checkPreferenceType: function(preference) {

    },

    /*
        used to set user contact details by preference 
        example:
        var onCallContactPreferenceUtil = new OnCallContactPreferenceUtil();
        if (preference === type) {
            userContactDetails.push({
                type: preference,
                email: onCallContactPreferenceUtil._getUserEmailAddress(userContact.sys_id)
            });
        }
    */

    setUserContactDetailsByPreferences: function(userContact, preference, userContactDetails, type, checkAccess) {

    },

    type: 'OnCallCommunication'
};
