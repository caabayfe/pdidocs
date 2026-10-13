var IPCConferenceParticipant = Class.create();
    IPCConferenceParticipant.prototype = {
        notifyUtil: null,
        initialize: function() {
            this.notifyUtil = new global.NotifyUtil();
        },
        CONF_LEADER_RESTRICTED_ACCESS_PROP: "com.snc.notify.conference_leader_restricted_access",

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
        getGroupDetails: function(groupId, inputData, /* Optional */alreadyGotGroupDetails, type) {
        },

        /**
         * @param {GlideRecord} sourceGr
         * @param {string} userId
         */
        isConferenceLeader: function(sourceGr, /* Optional */ userId) {
            var isNotLeader = false;
            var isConferenceLeaderAccessRestricted = GlideProperties.getBoolean(this.CONF_LEADER_RESTRICTED_ACCESS_PROP, true);
            if (isConferenceLeaderAccessRestricted && sourceGr.isValidRecord()) {
                var tablesToRolesJSON = this.notifyUtil.getTableNamesWithRolesForConferenceLeader();
                for (var table in tablesToRolesJSON) {
                    if (tablesToRolesJSON.hasOwnProperty(table) && sourceGr.instanceOf(table)) {
                        isNotLeader = true;
                        for (var role = 0; role < tablesToRolesJSON[table].length; role++) {
                            if ((!userId && gs.hasRole(tablesToRolesJSON[table][role])) || GlideUser.getUserByID(userId).hasRole(tablesToRolesJSON[table][role]))
                                return true;
                        }
                    }
                }
            }
            if (isNotLeader)
                return false;

            return;
        },

        /**
        * The extension point implementations are invoked in no specific order, the first one to respond
        * its response will be taken. If no implementations return then default notify for task number will
        * will be used.
        * @param {GlideRecord} sourceGr
        * @returns (string} undefined / a valid Notify number as string
        */
        getNotifyNumber: function (sourceGr) {
        },

        /**
            * @param {string} actionName
            * @param {GlideRecord} sourceGr
            * @param {string} userId
            */
        isActionAllowed: function(actionName, sourceGr, /* Optional */ userId) {
        },

        type: 'IPCConferenceParticipant'
    };
