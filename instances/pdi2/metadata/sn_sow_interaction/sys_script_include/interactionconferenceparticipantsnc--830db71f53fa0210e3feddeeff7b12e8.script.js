var InteractionConferenceParticipantSNC = Class.create();
InteractionConferenceParticipantSNC.prototype = {

    initialize: function() {},

    CONF_LEADER_RESTRICTED_ACCESS_PROP: "com.snc.notify.conference_leader_restricted_access",
    INTERACTION_TABLE: "interaction",
    WALK_UP_TYPE: "walkup",

    /**
     * @param {InputData} inputData
     * @param {ParticipantData} previousContacts
     * @param {String} type - NotifyUtil.numberType.sms | NotifyUtil.numberType.voice
     * @returns {ParticipantData}
     */
    getContacts: function(inputData, previousContacts, type) {
        return [];
    },

    /**
     * @param {string} groupId
     * @param {InputData} inputData
     * @param {ParticipantData} groupData
     * @param {String} type - NotifyUtil.numberType.sms | NotifyUtil.numberType.voice
     * @returns {ParticipantData}
     */
    getGroupDetails: function(groupId, inputData, /* Optional */ alreadyGotGroupDetails, type) {},

    /**
     * @param {GlideRecord} sourceGr
     * @param {string} userId
     */
    isConferenceLeader: function(sourceGr, /* Optional */ userId) {
        var isConferenceLeaderAccessRestricted = gs.getProperty(this.CONF_LEADER_RESTRICTED_ACCESS_PROP, true);
        if (isConferenceLeaderAccessRestricted && sourceGr.isValidRecord() && (sourceGr.getTableName() == this.INTERACTION_TABLE) && sourceGr.getValue("type") != this.WALK_UP_TYPE) {
            if ((!userId && sourceGr.canWrite()) || sourceGr.canWrite())
                return true;
            return false;
        }
        return;
    },

    /**
     * The extension point implementations are invoked in no specific order, the first one to respond
     * its response will be taken. If no implementations return then default notify for task number will
     * will be used.
     * @param {GlideRecord} sourceGr
     * @returns (string} undefined / a valid Notify number as string
     */
    getNotifyNumber: function(sourceGr) {},

    /**
     * @param {string} actionName
     * @param {GlideRecord} sourceGr
     * @param {string} userId
     */
    isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {},

    type: 'InteractionConferenceParticipantSNC'
};
