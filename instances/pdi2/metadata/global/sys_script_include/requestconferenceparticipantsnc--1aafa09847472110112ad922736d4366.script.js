var RequestConferenceParticipantSNC = Class.create();
    RequestConferenceParticipantSNC.prototype = {
        initialize: function() {},
        ITIL_ROLE: "itil",
        SN_REQUEST_WRITE_ROLE: 'sn_request_write',
        CONF_LEADER_RESTRICTED_ACCESS_PROP: "com.snc.notify.conference_leader_restricted_access",
        CATALOG_REQUEST_ITEM_TABLE: "sc_req_item",
        CATALOG_REQUEST_TABLE: "sc_request",
        CATALOG_TASK_TABLE: "sc_task",
        ITSM_ROLES_PLUGIN: 'com.snc.itsm.roles',
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
            var isConferenceLeaderAccessRestricted = GlideProperties.getBoolean(this.CONF_LEADER_RESTRICTED_ACCESS_PROP, true);
            if (isConferenceLeaderAccessRestricted && sourceGr.isValidRecord() && (sourceGr.instanceOf(this.CATALOG_REQUEST_ITEM_TABLE) || sourceGr.instanceOf(this.CATALOG_REQUEST_TABLE) || sourceGr.instanceOf(this.CATALOG_TASK_TABLE))) {
                if (((!userId && gs.hasRole(this.ITIL_ROLE)) || GlideUser.getUserByID(userId).hasRole(this.ITIL_ROLE)) || (GlidePluginManager.isActive(this.ITSM_ROLES_PLUGIN) && ((!userId && gs.hasRole(this.SN_REQUEST_WRITE_ROLE)) || GlideUser.getUserByID(userId).hasRole(this.SN_REQUEST_WRITE_ROLE))))
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
        type: 'RequestConferenceParticipantSNC'
    };
