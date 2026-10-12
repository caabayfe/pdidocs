var SGTScanResultDAO = Class.create();
SGTScanResultDAO.prototype = {
    initialize: function() {
        this.SCAN_RESULT_TABLE_NAME = 'sgt_scan_result';
        this.SYS_USER_GRMEMBER = "sys_user_grmember";
        this.SYS_CREATED_ON = 'sys_created_on';
        this.SCAN_ID = 'scan';
        this.LAST_SCRIPTED = 'last_scripted';
        this.USER = 'user';
        this.KEEP = 'keep';
        this.IN = 'IN';
        this.SYS_ID = 'sys_id';
        this.GROUP = 'group';
        this.COUNT = 'COUNT';
        this.CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID = '5ee74940b70022108d4406dd1e11a918';
    },

    getScanHistoryDAO: () => new SGTScanHistoryDAO(),

    getMemberRemovalJobHistoryDAO: () => new SGTMemberRemovalJobHistoryDAO(),

    createScanResultForManualScan(scanID, userList) {
        userList.forEach(userId => this.saveRecordInScanResultTable(scanID, userId, null));
    },

    saveRecordInScanResultTable: function(scanID, user, lastScriptedDate) {
        var scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanID);
        scanResultGR.addQuery(this.USER, user);
        scanResultGR.query();
        if (scanResultGR.next()) {
            if (!this._shouldUpdateRecord(lastScriptedDate, scanResultGR.getValue(this.LAST_SCRIPTED))) {
                return;
            }
            scanResultGR.setValue(this.LAST_SCRIPTED, lastScriptedDate);
            scanResultGR.update();
            return;
        }
        this._createRecordInScanResultTable(scanID, user, lastScriptedDate);
    },

    getScriptedUsersGR: function(scanID, users) {
        var scriptedUserGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scriptedUserGR.addQuery(this.SCAN_ID, scanID);
        scriptedUserGR.addQuery(this.USER, this.IN, Array.from(users).join(","));
        scriptedUserGR.addQuery(this.KEEP, true);
        scriptedUserGR.query();
        return scriptedUserGR;
    },

    _createRecordInScanResultTable: function(scanID, user, lastScriptedDate) {
        var scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.setValue(this.SCAN_ID, scanID);
        scanResultGR.setValue(this.USER, user);
        scanResultGR.setValue(this.LAST_SCRIPTED, lastScriptedDate);
        scanResultGR.setValue(this.KEEP, true);
        scanResultGR.insert();
    },

    moveUsersToRemoveList: function(scanResults) {
        let scanResultIdsToUpdate = [];
        let scanResultIdsToDelete = [];

        scanResults.forEach(scanResult => {
            let scanResultId = scanResult.scanResultId;
            if (scanResult.lastScripted)
                scanResultIdsToUpdate.push(scanResultId);
            else
                scanResultIdsToDelete.push(scanResultId);
        });

        if (scanResultIdsToUpdate.length > 0) {
            this._updateKeepForScanResults(scanResultIdsToUpdate, false);
        }

        if (scanResultIdsToDelete.length > 0) {
            this._deleteScanResults(scanResultIdsToDelete);
        }
    },

    moveUsersToKeepList: function(scanId, scanResults) {
        let cswMembersToAdd = [];
        let scanResultIdsToUpdate = [];

        scanResults.forEach(scanResult => {
            if (scanResult.lastScripted)
                scanResultIdsToUpdate.push(scanResult.scanResultId);
            else
                cswMembersToAdd.push(scanResult.grmemberId);
        });

        if (scanResultIdsToUpdate.length > 0) {
            this._updateKeepForScanResults(scanResultIdsToUpdate, true);
        }

        if (cswMembersToAdd.length > 0) {
            let userIds = this._getUsersFromGRMemberIds(cswMembersToAdd);
            userIds.forEach(userId => this._createRecordInScanResultTable(scanId, userId, ""));
        }

    },

    moveAllUsersToRemoveList: function(scanId) {
        this._updateKeepForScriptedUsers(scanId);
        this._resetUsersAddedToKeepList(scanId);
    },

    _updateKeepForScriptedUsers: function(scanId) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanId);
        scanResultGR.addQuery(this.KEEP, true);
        scanResultGR.setValue(this.KEEP, false);
        scanResultGR.updateMultiple();
    },

    resetScanResults: function(scanId, manualScan) {
        if (!this._anyScanResultRecordsToReset(scanId) ||
            this.getMemberRemovalJobHistoryDAO().isAnyJobScheduledOrRunning()) {
            return;
        }

        if (manualScan) {
            this._resetManualScanResults(scanId);
        } else {
            this._resetUsersAddedToRemoveList(scanId);
            this._resetUsersAddedToKeepList(scanId);
        }
    },

    _anyScanResultRecordsToReset: function(scanId) {
        let scanResultGA = new GlideAggregate(this.SCAN_RESULT_TABLE_NAME);
        scanResultGA.addAggregate(this.COUNT);
        scanResultGA.addQuery(this.SCAN_ID, scanId);
        scanResultGA.addNotNullQuery(this.LAST_SCRIPTED).addOrCondition(this.KEEP, false);
        scanResultGA.query();
        scanResultGA.next();
        return scanResultGA.getAggregate(this.COUNT) > 0;
    },

    _resetUsersAddedToRemoveList(scanId) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanId);
        scanResultGR.addNotNullQuery(this.LAST_SCRIPTED);
        scanResultGR.addQuery(this.KEEP, false);
        scanResultGR.setValue(this.KEEP, true);
        scanResultGR.updateMultiple();
    },

    _resetUsersAddedToKeepList(scanId) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanId);
        scanResultGR.addNullQuery(this.LAST_SCRIPTED);
        scanResultGR.deleteMultiple();
    },

    _resetManualScanResults(scanId) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanId);
        scanResultGR.setValue(this.KEEP, true);
        scanResultGR.updateMultiple();
    },

    _getUsersFromGRMemberIds: function(grMemberIds) {
        let userGRMemberGR = new GlideRecord(this.SYS_USER_GRMEMBER);
        userGRMemberGR.addQuery(this.SYS_ID, this.IN, grMemberIds.join());
        userGRMemberGR.query();
        let users = [];
        while (userGRMemberGR.next()) {
            users.push(userGRMemberGR.getValue(this.USER));
        }
        return users;
    },

    _updateKeepForScanResults: function(scanResultIds, keep) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SYS_ID, this.IN, scanResultIds.join());
        scanResultGR.setValue(this.KEEP, keep);
        scanResultGR.updateMultiple();
    },

    _deleteScanResults: function(scanResultIds) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SYS_ID, this.IN, scanResultIds.join());
        scanResultGR.deleteMultiple();
    },

    getCSWMembersCount: function(scanId) {
        var jobScheduledTime = this.getScanHistoryDAO().getJobScheduledTime(scanId);
        let cswMembers = {};
        cswMembers.total = this._getCSWGroupMembersCount(jobScheduledTime);
        cswMembers.scriptedUsers = this._getScriptedUsersCount(scanId);
        cswMembers.notScriptedUsers = cswMembers.total - cswMembers.scriptedUsers;
        return cswMembers;
    },

    getKeepListUserId: function(scanID) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.addQuery(this.SCAN_ID, scanID);
        scanResultGR.addQuery(this.KEEP, true);
        scanResultGR.query();
        var userList = [];
        while (scanResultGR.next()) {
            userList.push(scanResultGR.getValue(this.USER));
        }
        return userList;
    },

    _getCSWGroupMembersCount: function(jobScheduledTime) {
        let userGRMemberGA = new GlideAggregate(this.SYS_USER_GRMEMBER);
        userGRMemberGA.addAggregate(this.COUNT);
        userGRMemberGA.addQuery(this.GROUP, this.CONDITIONAL_SCRIPT_WRITER_GROUP_SYS_ID);
        userGRMemberGA.addQuery(this.SYS_CREATED_ON, '<=', jobScheduledTime);
        userGRMemberGA.query();
        userGRMemberGA.next();
        return userGRMemberGA.getAggregate(this.COUNT);
    },

    _getScriptedUsersCount: function(scanId) {
        let scanResultGA = new GlideAggregate(this.SCAN_RESULT_TABLE_NAME);
        scanResultGA.addAggregate(this.COUNT);
        scanResultGA.addQuery(this.SCAN_ID, scanId);
        scanResultGA.addQuery(this.KEEP, true);
        scanResultGA.query();
        scanResultGA.next();
        return scanResultGA.getAggregate(this.COUNT);
    },

    getUserInScanResult: function(scanResultId) {
        let scanResultGR = new GlideRecord(this.SCAN_RESULT_TABLE_NAME);
        scanResultGR.get(scanResultId);
        return scanResultGR.getValue(this.USER);
    },

    getUserInGRMember: function(grMemberId) {
        let userGRMemberGR = new GlideRecord(this.SYS_USER_GRMEMBER);
        userGRMemberGR.get(grMemberId);
        return userGRMemberGR.getValue(this.USER);
    },

    _shouldUpdateRecord: function(newLastScriptedDate, oldLastScriptedDate) {
        if (newLastScriptedDate && oldLastScriptedDate) {
            var newLastScriptedDateTime = new GlideDateTime(newLastScriptedDate);
            var oldLastScriptedDateTime = new GlideDateTime(oldLastScriptedDate);
            return newLastScriptedDateTime.after(oldLastScriptedDateTime);
        }
        return newLastScriptedDate != null;
    },

    type: 'SGTScanResultDAO'
};
