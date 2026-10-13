/**
 * @typedef {{
			table: string,
			sysId: string,
			confId?: string,
			}} InputData
 * @typedef {Array<{
					 name: string,
					 id: string,
					 phoneNumber?: string,
					 showGroupName?: boolean,
					 users?: Array<{name: string, id: string, phoneNumber?: string}>}>} ParticipantData
 * @typedef {{table: string, sysId: string, confId: string, items: ParticipantData}} ConfInputData
*/
var OnCallConferenceParticipants = Class.create();
OnCallConferenceParticipants.prototype = {
    initialize: function() {
        this.ocr = new OnCallRotation();
        this.notifyUtils = new global.NotifyUtil();
        this.onCallNotifyUtil = new global.OnCallNotifyUtil();
    },

    /**
     * @param {string} table
     * @param {string} id
     * @returns {GlideRecord & RecordMetaInfo}
     */
    _getRecordBySysID: function(table, id) {
        var record = new GlideRecord(table);
        if (record.get(id))
            return record;
    },

    /**
     * @param {string} id
     * @returns {SysUserGR}
     */
    _getUserByID: function(id) {
        return this._getRecordBySysID('sys_user', id);
    },

    /**
     * @param {string} groupId
     */
    _whoIsOnCall: function(groupId) {

        if (groupId) {
            var escalatees = this.ocr.getEscalatees(groupId);
            for (var i = 0; i < escalatees.length; i++) {
                var userGr = this._getUserByID(escalatees[i].userId);
                if (!userGr)
                    continue;
                escalatees[i].name = userGr.name + "";
                escalatees[i].rosterName = this._getRosterName(escalatees[i].roster);
            }
            return escalatees;
        }
    },

    _getRosterName: function(rosterId) {
        var rosterGr = new GlideRecord('cmn_rota_roster');
        if (rosterGr.get(rosterId))
            return rosterGr.name;
    },

    /**
     * @param {SysUserGroupGR} groupGr
     * @param {string} tableName
     * @param {string} sysId
     * @returns {Array<any>}
     */
    _getOnCallResourcesForGroup: function(groupGr, tableName, sysId, type) {
        var onCallResources = [];
        if (!groupGr)
            return onCallResources;
        var gr = new GlideRecord(tableName);
        if (!gr.get(sysId))
            return onCallResources;

        if (!this._groupHasRotas(groupGr))
            return onCallResources;
        var escalatees = this._whoIsOnCall(groupGr.sys_id + "");
        var groupName = groupGr.name + '';
        var result = [];
        // iterate over contacts in the escalation plan
        var userObject;

        var escalationLevel = this.onCallNotifyUtil.getOnCallEscalationLevel(tableName);
        var displayPlanSize = ((escalationLevel == -1) || escalationLevel >= escalatees.length) ? escalatees.length : escalationLevel;
        for (var i = 0; i < displayPlanSize; i++) {
            var contact = escalatees[i];
            userObject = this._getUserContactObject(contact.userId + '', contact.rosterName, groupName, type);
            if (userObject) {
                result.push(userObject);
            }
            var userIds = contact.userIds;
            if (userIds) {
                for (var k = 0; k < userIds.length; k++) {
                    userObject = this._getUserContactObject(userIds[k], contact.rosterName, groupName, type);
                    if (userObject) {
                        result.push(userObject);
                    }
                }
            }
        }
        return result;
    },

    _getUserContactObject: function(userId, rosterName, groupName, type) {
        rosterName = rosterName || '';
        var userGr = this._getUserByID(userId);
        if (!userGr)
            return;
        if (!userGr.active)
            return;

        var name;
        if (rosterName)
            name = gs.getMessage("{0} ({1} {2})", [userGr.getDisplayValue(), rosterName, groupName]);
        else
            name = gs.getMessage("{0} ({1})", [userGr.getDisplayValue(), groupName]);

        var numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userId], [], type);
        return {
            name: name,
            id: userId,
            phoneNumber: numbers.length > 0 ? numbers[0] : ''
        };
    },

    /**
     * @param {SysUserGroupGR} groupGr
     * @returns {boolean}
     */
    _groupHasRotas: function(groupGr) {
        if (groupGr) {
            var rota = new GlideRecord('cmn_rota');
            rota.addActiveQuery();
            rota.addQuery('group', groupGr.sys_id + '');
            rota.query();
            return rota.next();
        }
        return false;
    },

    /**
     * @param {string} groupId
     * @param {string} tableName
     * @param {string} sysId
     */
    _getOnCallResourcesForGroupId: function(groupId, tableName, sysId, type) {
        var gr = new GlideRecord("sys_user_group");
        if (!gr.get(groupId))
            return [];
        return this._getOnCallResourcesForGroup(gr, tableName, sysId, type);
    },

    /**
     * @param {InputData} inputData
     * @param {ParticipantData} previousContacts
     * @returns {ParticipantData}
     */
    getContacts: function(inputData, previousContacts, type) {
        return []; // On-Call has no users to resolve to for a given context record
    },

    /**
     * @param {string} groupId
     * @param {InputData} inputData
     * @param {ParticipantData} groupData
     * @returns {ParticipantData}
     */
    getGroupDetails: function(groupId, inputData, alreadyGotGroupDetails, type) {

        if (alreadyGotGroupDetails && alreadyGotGroupDetails.users && alreadyGotGroupDetails.users.length) // Some extension already resolved the members?
            // This extension is non-cooperative and empties out that list.
            alreadyGotGroupDetails.users.splice(0, alreadyGotGroupDetails.users.length);

        var response = {};
        var users;
        var grpGr = new GlideRecord("sys_user_group");
        if (!grpGr.get(groupId))
            return;

        if (!this._groupHasRotas(grpGr)) {
            var result = {};
            if (this.onCallNotifyUtil.isAddAllMembersOnNoRotaEnabled(inputData.table)) {
                result.users = this._getAllMembersInGroup(grpGr, type);
                result.message = {
                    messageType: "info",
                    messageText: gs.getMessage("All the members are added since the on-call rota isn’t defined on the selected group.")
                };
            } else {
                result.users = [];
                result.message = {
                    messageType: "info",
                    messageText: gs.getMessage("No members are added since the on-call rota isn’t defined on the selected group.")
                };
            }
            return result;
        }

        var followOnCallEscalationEnabled = this.onCallNotifyUtil.isFollowOnCallEscalationEnabled(inputData.table);
        if (followOnCallEscalationEnabled && (type !== this.notifyUtils.numberType.sms)) {
            // For SMS flows we Add the Primary, Secondary and Tertiary and do not follow the escalation property. 
            var currentOncallEscalatees = [];
            if (this.ocr && this._groupHasRotas(grpGr)) {
                /* IMP NOTE: depth should always be 1 (one) as followOnCallEscalation is enabled. */
                var depth = 1;
                var taskGr = new GlideRecord(inputData.table);
                if (!taskGr.get(inputData.sysId))
                    return;
                var escalationPlan = this.ocr.getEscalationPlan(groupId, null, "", taskGr);
                var planSize = escalationPlan.length;
                var displayPlanSize = ((depth == -1) || (depth >= planSize)) ? planSize : depth;

                for (var i = 0; i < displayPlanSize; i++) {
                    var escalatee = escalationPlan[i];
                    this.onCallNotifyUtil.addEscalatee(escalatee, currentOncallEscalatees, grpGr, followOnCallEscalationEnabled, taskGr);
                    for (var j = 0; j < escalatee.additionalEscalatees.length; j++) {
                        var additionalEscalatee = escalatee.additionalEscalatees[j];
                        this.onCallNotifyUtil.addEscalatee(additionalEscalatee, currentOncallEscalatees, grpGr, followOnCallEscalationEnabled, taskGr);
                    }
                }
                users = this.onCallNotifyUtil.fetchUsersOnEscalateesPreferences(groupId, inputData, currentOncallEscalatees, type);
            }
            response = {
                showGroupName: this.onCallNotifyUtil.isFollowOnCallEscalationEnabled(inputData.table),
                users: users
            };
        } else {
            response = {
                users: this._getOnCallResourcesForGroupId(groupId, inputData.table, inputData.sysId, type)
            };
        }

        if (!response.users || response.users.length == 0) {
            response.message = {
                messageType: "info",
                messageText: gs.getMessage("There are no on-call members available on the rota at this time for the group you selected.")
            };
        }

        return response;
    },

    _getAllMembersInGroup: function(grpGr, type) {
        var userGr = new GlideRecord("sys_user");
        userGr.addActiveQuery();
        var cond = userGr.addJoinQuery("sys_user_grmember", "sys_id", "user");
        cond.addCondition("group", grpGr.getUniqueValue());
        userGr.query();
        var numbers;
        var contacts = [];
        while (userGr.next()) {
            numbers = this.notifyUtils.getUniquePhoneNumbersForUsersAndGroups([], [userGr.getUniqueValue() + ''], [], type);
            contacts.push({
                name: gs.getMessage("{0} ({1})", [userGr.getDisplayValue(), grpGr.getDisplayValue()]),
                id: userGr.getUniqueValue() + '',
                phoneNumber: numbers.length > 0 ? numbers[0] : ''
            });
        }
        return contacts;
    },

    /**
     * @param {GlideRecord} sourceGr
     * @param {string} userId
     */
    isConferenceLeader: function(sourceGr, /* optional */ userId) {},

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

    type: 'OnCallConferenceParticipants'
};
