var SGTGrpMemberRemovalJob = Class.create();
SGTGrpMemberRemovalJob.prototype = {
    initialize: function() {
        this.memberRemovalJobHistoryDAO = new SGTMemberRemovalJobHistoryDAO();
        this.sgtProps = new SGTProperties();
        this.scanHistoryDAO = new SGTScanHistoryDAO();
        this.scanResultDAO = new SGTScanResultDAO();
        this.GRP_MEMBER_TABLE_NAME = 'sys_user_grmember';
        this.USER = 'user';
        this.SYS_CREATED_ON = 'sys_created_on';
        this.GROUP_NAME = 'group.name';
        this.SCRIPT_WRITER_GROUP_NAME = "Conditional Script Writer";
        this.LESS_THAN_EQUALS = '<=';
        this.GREATER_THAN = '>';
        this.SYS_ID = 'sys_id';
        this.IN = 'IN';
        this.SYS_USER_HAS_ROLE = 'sys_user_has_role';
        this.ROLE_NAME = 'role.name';
        this.SCRIPT_WRITER_ROLE_NAME = 'snc_required_script_writer_permission';
        this.SECURITY_ADMIN = 'security_admin';
        this.BATCH_SIZE = 800;
        this.TOTAL_RECORDS_PROCESSED_IN_ONE_JOB = 100000;
    },

    execute: function(jobID, scanID, lastProcessedGRMbrSysID) {
        try {
            if (!this._isAuthorized()) {
                gs.error('Scripting Governance Tool: User doesn\'t have necessary role to run the Member Removal history job with job id:' + jobID);
                this.memberRemovalJobHistoryDAO.updateRemovalJobStatus(jobID, scanID, this.memberRemovalJobHistoryDAO.JOB_STATUS.ERROR);
                return;
            }
            this.memberRemovalJobHistoryDAO.updateRemovalJobStatus(jobID, scanID, this.memberRemovalJobHistoryDAO.JOB_STATUS.IN_PROGRESS);
            if (!lastProcessedGRMbrSysID) {
                gs.info('Scripting Governance Tool: Job to remove users from script writer group is started for job id:' + jobID);
            } else {
                gs.info('Scripting Governance Tool: Job to remove users from script writer group is restarted for job id:' + jobID);
            }
            var jobScheduledTime = this.scanHistoryDAO.getJobScheduledTime(scanID);
            var scriptWriterGroupMemberGR = this._getScriptWriterGroupMemberRecords(scanID, jobScheduledTime, lastProcessedGRMbrSysID);
            let deletedUserCount = 0;
            let scriptWriterGroupUsers = new Set();
            let scriptWriterGroupUsersCount = 0;
            while (scriptWriterGroupMemberGR.next()) {
                ++scriptWriterGroupUsersCount;
                scriptWriterGroupUsers.add(scriptWriterGroupMemberGR.getValue(this.USER));
                lastProcessedGRMbrSysID = scriptWriterGroupMemberGR.getValue(this.SYS_ID);
                if (scriptWriterGroupUsersCount % this.BATCH_SIZE != 0 && scriptWriterGroupMemberGR.hasNext()) {
                    continue;
                }
                deletedUserCount = deletedUserCount + this._removeNonScriptedUsers(scanID, scriptWriterGroupUsers);
                scriptWriterGroupUsers = new Set();
                if (scriptWriterGroupUsersCount >= this.TOTAL_RECORDS_PROCESSED_IN_ONE_JOB) {
                    gs.info('Scripting Governance Tool: Total number of users removed from script writer group is ' + deletedUserCount + ' for job id ' + jobID);
                    this._scheduleNextMemberRemovalJob(jobID, scanID, lastProcessedGRMbrSysID);
                    return;
                }
            }
            gs.info('Scripting Governance Tool: Total number of users removed from script writer group is:' + deletedUserCount + ' for job id ' + jobID);
            this.memberRemovalJobHistoryDAO.updateRemovalJobStatus(jobID, scanID, this.memberRemovalJobHistoryDAO.JOB_STATUS.COMPLETED);
        } catch (e) {
            this.memberRemovalJobHistoryDAO.updateRemovalJobStatus(jobID, scanID, this.memberRemovalJobHistoryDAO.JOB_STATUS.ERROR);
            gs.error('Scripting Governance Tool: GRP Member Removal Job Failed: ' + e);
        }
    },

    scheduleForRemoval: function(scanID, scheduledTime) {
        var resp = {
            error: '',
            result: null
        };

        if (!this._isAuthorized()) {
            gs.error('Scripting Governance Tool: User doesn\'t have necessary role to run the job for scan id:' + scanID);
            resp.error = gs.getMessage("User doesn't have necessary role");
            return resp;
        }

        try {
            var canSchedule = this._canSchedule(scanID);

            if (canSchedule.result === false) {
                return canSchedule;
            }

            this.sgtProps.updateAutoProvisioningProperty(false);

            var gdt = new GlideDateTime();
            gdt.add(scheduledTime * 3600 * 1000);
            var jobID = this.memberRemovalJobHistoryDAO.save(scanID, gdt);

            if (!jobID) {
                gs.error(`Scripting Governance Tool: Error while saving into grp member removal job table, scan id:  ${scanID}`);
                resp.error = 'Server error while saving data into member removal job history table';
                return resp;
            }

            this._scheduleMemberRemovalJob(jobID, scanID, '', gdt);

        } catch (err) {
            gs.error(`Scripting Governance Tool: ${err}, scan id:  ${scanID}`);
        }

        return resp;
    },

    _scheduleMemberRemovalJob: function(jobID, scanID, lastProcessedGRMbrSysID, when) {
        var job = new GlideRunScriptJob();
        var script = "new SGTGrpMemberRemovalJob().execute('" + jobID + "','" + scanID + "','" + lastProcessedGRMbrSysID + "');";
        var jobName = 'SGT GrpMemberRemovalJob for ' + jobID;
        job.scheduleScript(script, jobName, when);
    },

    _canSchedule: function(scanID) {

        var error = '';

        if (this.sgtProps.isInitialAutoProvisionJobRunning()) {
            gs.error(`Scripting Governance Tool: Initial auto provisioning job is running, scan id:  ${scanID}`);
            error = gs.getMessage("Initial auto provisioning job is running.");

        } else if (this.scanHistoryDAO.isAnyJobScheduledOrRunning()) {
            gs.error(`Scripting Governance Tool: Scan History job is running or scheduled, scan id: ${scanID}`);
            error = gs.getMessage("Scan History job is running or scheduled");

        } else if (this.memberRemovalJobHistoryDAO.isAnyJobScheduledOrRunning()) {
            gs.error(`Scripting Governance Tool: Conditional script writer group member removal job is running or scheduled, scan id:  ${scanID}`);
            error = gs.getMessage("Conditional script writer group member removal job is running or scheduled");

        } else if (this.sgtProps.isDailyAutoProvisioningJobRunning()) {
            gs.error(`Scripting Governance Tool: Daily auto provisioning job is running, scan id: ${scanID}`);
            error = gs.getMessage("Daily auto provisioning job is running.");
        }

        return {
            error: error,
            result: error === ''
        };
    },

    _removeMembersFromGrp: function(userIDs) {
        if (!userIDs || userIDs.size == 0) {
            return;
        }
        var userIDsCommaSeparatedValue = Array.from(userIDs).join(',');
        this._removeUsersFromGroupMember(userIDsCommaSeparatedValue);
        this._removeRoleFromUsers(userIDsCommaSeparatedValue);
    },

    _removeUsersFromGroupMember: function(userIDsCommaSeparatedValue) {
        if (!userIDsCommaSeparatedValue) {
            return;
        }
	var grpMemberQuery = new GlideDBQuery(this.GRP_MEMBER_TABLE_NAME);
	var grpMemberDelete = new GlideDBDelete(this.GRP_MEMBER_TABLE_NAME);
        try {
            grpMemberQuery.addQuery(this.GROUP_NAME, this.SCRIPT_WRITER_GROUP_NAME);
            grpMemberQuery.addQuery(this.USER, this.IN, userIDsCommaSeparatedValue);
            grpMemberDelete.setQuery(grpMemberQuery);
            grpMemberDelete.setMultiple(true);
            grpMemberDelete.execute();
        } finally {
            grpMemberQuery.close();
            grpMemberDelete.close();
        }
    },

    _removeRoleFromUsers: function(userIDsCommaSeparatedValue) {
        if (!userIDsCommaSeparatedValue) {
            return;
        }
	var userRoleQuery = new GlideDBQuery(this.SYS_USER_HAS_ROLE);
	var userRoleDelete = new GlideDBDelete(this.SYS_USER_HAS_ROLE);
        try {
            userRoleQuery.addQuery(this.ROLE_NAME, this.SCRIPT_WRITER_ROLE_NAME);
            userRoleQuery.addQuery(this.USER, this.IN, userIDsCommaSeparatedValue);
            userRoleDelete.setQuery(userRoleQuery);
            userRoleDelete.setMultiple(true);
            userRoleDelete.execute();
        } finally {
            userRoleQuery.close();
            userRoleDelete.close();
        }
    },

    _getScriptWriterGroupMemberRecords: function(scanID, jobScheduledTime, lastProcessedGRMbrSysID) {
        var grpMbrGR = new GlideRecord(this.GRP_MEMBER_TABLE_NAME);
        grpMbrGR.addQuery(this.GROUP_NAME, this.SCRIPT_WRITER_GROUP_NAME);
        grpMbrGR.addQuery(this.SYS_CREATED_ON, this.LESS_THAN_EQUALS, jobScheduledTime);
        if (lastProcessedGRMbrSysID) {
            grpMbrGR.addQuery(this.SYS_ID, this.GREATER_THAN, lastProcessedGRMbrSysID);
        }
        grpMbrGR.orderBy(this.SYS_ID);
        grpMbrGR.query();
        grpMbrGR.setLimit(this.TOTAL_RECORDS_PROCESSED_IN_ONE_JOB);
        return grpMbrGR;
    },

    _removeNonScriptedUsers: function(scanID, users) {
        let nonScriptedUsers = new Set(users);
        var scriptUserGR = this.scanResultDAO.getScriptedUsersGR(scanID, users);
        while (scriptUserGR.next()) {
            nonScriptedUsers.delete(scriptUserGR.getValue(this.USER));
        }
        this._removeMembersFromGrp(nonScriptedUsers);
        return nonScriptedUsers.size;
    },

    _scheduleNextMemberRemovalJob: function(jobID, scanID, lastProcessedGRMbrSysID) {
        var when = new GlideDateTime();
        when.addSeconds(30);
        this._scheduleMemberRemovalJob(jobID, scanID, lastProcessedGRMbrSysID, when);
    },

    _isAuthorized() {
        return GlideSession.get().hasRole(this.SECURITY_ADMIN);
    },

    type: 'SGTGrpMemberRemovalJob'
};
