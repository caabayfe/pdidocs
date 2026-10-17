var SGTScanJob = Class.create();

SGTScanJob.prototype = {

    initialize: function() {
        this.scanHistoryDAO = new SGTScanHistoryDAO();
        this.scanResultDAO = new SGTScanResultDAO();
        this.SCRIPT_LIKE_DATATYPE = ['script', 'script_plain', 'script_client', 'script_server', 'email_script', 'condition_string', 'html_script', 'html_template', 'xml'];
        this.EXCLUDED_USERS_LIST = ['guest', 'maint', 'system'];
        this.SYS_DICTIONARY_TABLE_NAME = 'sys_dictionary';
        this.INTERNAL_TYPE = 'internal_type';
        this.NAME = 'name';
        this.TYPE = 'type';
        this.SYS_ID = 'sys_id';
        this.CUSTOMER_UPDATES_TABLE_NAME = 'sys_update_version';
        this.ACTION = 'action';
        this.SYS_CREATED_ON = 'sys_created_on';
        this.SYS_CREATED_BY = 'sys_created_by';
        this.USER_TABLE_NAME = 'sys_user';
        this.USERNAME = 'user_name';
        this.IN = 'IN';
        this.NOT_IN = 'NOT IN';
        this.STARTSWITH = 'STARTSWITH';
        this.GREATER_THAN_EQUALS = '>=';
        this.LESS_THAN_EQUALS = '<=';
        this.CHECK_JOB_CANCL_AFTER_EVERY_RECORDS = 200;
        this.HANDLE_DUPLICATE_USER_NAME = true;
        this.SECURITY_ADMIN = 'security_admin';
        this.GRMEMBER_TABLE_NAME = 'sys_user_grmember';
        this.GROUP_NAME = 'group.name';
        this.SCRIPT_WRITER_GROUP_NAME = "Conditional Script Writer";
        this.GRMEMBER_USER_COLUMN = 'user';
        this.TYPE_COLUMN_LENGTH = this._getTypeColumnLength();
        this.SYS_DB_OBJECT_TABLE_NAME = 'sys_db_object';
        this.SYS_DB_OBJECT_NAME_COLUMN = 'name';
        this.SYS_DB_OBJECT_LABEL_COLUMN = 'label';
        this.UNDERSCORE = '_';
    },

    schedule: function(params) {
        if (!this._isAuthorized()) {
            gs.error('Scripting Governance Tool: User doesn\'t have necessary role to run the job for user id:' + params.user);
            return;
        }

        var scanID = '';
        try {
            scanID = this.scanHistoryDAO.create(params.scheduledTime, params.notScriptedInDays);
            if (!scanID) {
                gs.error('Scripting Governance Tool: Unable to insert record in scan_history table');
                return;
            }
            var job = new GlideRunScriptJob();
            var script = `new SGTScanJob().execute('${scanID}');`;
            job.scheduleScript(script, `SGT Scan for ${scanID}`, params.scheduledTime);

        } catch (e) {
            gs.error('Scripting Governance Tool: Unable to schedule (Scan ID: ' + scanID + ') - ' + e);
        }
    },

    cancel: function(scanID) {
        if (!this._isAuthorized()) {
            gs.error('Scripting Governance Tool: User doesn\'t have necessary role to cancel the job for scan id:' + scanID);
            return;
        }
        this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.CANCELLED);
    },

    execute: function(scanID) {
        try {
            if (!this._isAuthorized()) {
                gs.error('Scripting Governance Tool: User doesn\'t have necessary role to run the job for scan id:' + scanID);
                this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.ERROR);
            }
            if (this.scanHistoryDAO.isJobCancelled(scanID)) {
                gs.info('Scripting Governance Tool: Scan job has been cancelled. The scan id of job is ' + scanID);
                return;
            }
            this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.IN_PROGRESS);
            var daysToAudit = this.scanHistoryDAO.getDaysToAudit(scanID);
            if (!daysToAudit) {
                gs.warn('Scripting Governance Tool: Unable to find the total number of days for which data needs to be audited');
                this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.ERROR);
                return;
            }
            var tablesContainingScriptFieldsGA = this._fetchAllTablesContainingScriptFields();
            let totalRecords = 0;
            var jobScheduledTime = this.scanHistoryDAO.getJobScheduledTime(scanID);
            if (!jobScheduledTime) {
                this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.ERROR);
                return;
            }
            var endTime = jobScheduledTime;
            var startTime = new GlideDateTime(endTime);
            startTime.addDays(-1 * daysToAudit);
            while (tablesContainingScriptFieldsGA.next()) {
                var tableName = tablesContainingScriptFieldsGA.getValue(this.NAME);
                var tableLabel = this._getTableLabel(tableName);
                var recordWithScriptFieldChangesGR = this._getAllRecordsWithScriptFieldChanges(tableName, tableLabel, this.EXCLUDED_USERS_LIST, startTime, endTime);
                while (recordWithScriptFieldChangesGR.next()) {

                    //we are using startswith[tableName] in query, hence check if gr name matches with tableName 
                    var versionRecordName = recordWithScriptFieldChangesGR.getValue(this.NAME);
                    if (!this._matchesTableName(tableName, versionRecordName)) {
                        continue;
                    }

                    var user = recordWithScriptFieldChangesGR.getValue(this.SYS_CREATED_BY);
                    var userSysID = this._getUserSysID(user);
                    if (!userSysID) {
                        continue;
                    }
                    var lastScriptedDate = recordWithScriptFieldChangesGR.getValue(this.SYS_CREATED_ON);
                    this.scanResultDAO.saveRecordInScanResultTable(scanID, userSysID, lastScriptedDate);
                    ++totalRecords;
                    if ((totalRecords % this.CHECK_JOB_CANCL_AFTER_EVERY_RECORDS == 0) && this.scanHistoryDAO.isJobCancelled(scanID)) {
                        gs.info('Scripting Governance Tool: Scan job has been cancelled. The scan id of job is ' + scanID);
                        return;
                    }
                }
            }
            this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.COMPLETED);
        } catch (e) {
            this.scanHistoryDAO.updateStatus(scanID, this.scanHistoryDAO.JOB_STATUS.ERROR);
            gs.error('Scripting Governance Tool: Job Failed: ' + e);
        }
    },

    _fetchAllTablesContainingScriptFields: function() {
        var dictionaryGA = new GlideAggregate(this.SYS_DICTIONARY_TABLE_NAME);
        dictionaryGA.addQuery(this.INTERNAL_TYPE, this.IN, this.SCRIPT_LIKE_DATATYPE.join(','));
        dictionaryGA.groupBy(this.NAME);
        dictionaryGA.query();
        return dictionaryGA;
    },

    _getAllRecordsWithScriptFieldChanges: function(tableName, tableLabel, excludedUsersList, startTime, endTime) {
        var customerUpdatesGR = new GlideRecord(this.CUSTOMER_UPDATES_TABLE_NAME);
        customerUpdatesGR.addQuery(this.ACTION, 'INSERT_OR_UPDATE');
        customerUpdatesGR.addQuery(this.NAME, this.STARTSWITH, tableName);
        customerUpdatesGR.addQuery(this.SYS_CREATED_ON, this.GREATER_THAN_EQUALS, startTime);
        customerUpdatesGR.addQuery(this.SYS_CREATED_ON, this.LESS_THAN_EQUALS, endTime);
        customerUpdatesGR.addQuery(this.SYS_CREATED_BY, this.NOT_IN, excludedUsersList.join(','));
        customerUpdatesGR.addNotNullQuery(this.SYS_CREATED_BY);
        if (tableLabel) {
            customerUpdatesGR.addQuery(this.TYPE, this._truncatedLabel(tableLabel));
        }
        customerUpdatesGR.query();
        return customerUpdatesGR;
    },

    _getUserSysID: function(user) {
        var userGR = new GlideRecord(this.USER_TABLE_NAME);
        userGR.addQuery(this.USERNAME, user);
        userGR.query();
        if (userGR.getRowCount() > 1 && !this.HANDLE_DUPLICATE_USER_NAME) {
            gs.info("Scripting Governance Tool: Multiple users found with username:" + user);
            return null;
        }
        if (userGR.next()) {
            var userSysId = userGR.getValue(this.SYS_ID);
            if (!this._isUserMemberOfScriptWriterGroup(userSysId)) {
                return null;
            }
            return userSysId;
        }
        gs.debug('Scripting Governance Tool: User not found with username: ' + user);
        return null;
    },

    _isAuthorized() {
        return GlideSession.get().hasRole(this.SECURITY_ADMIN);
    },

    _isUserMemberOfScriptWriterGroup: function(userSysId) {
        var groupMemberGR = new GlideRecord(this.GRMEMBER_TABLE_NAME);
        groupMemberGR.addQuery(this.GROUP_NAME, this.SCRIPT_WRITER_GROUP_NAME);
        groupMemberGR.addQuery(this.GRMEMBER_USER_COLUMN, userSysId);
        groupMemberGR.query();
        return groupMemberGR.hasNext();
    },

    _getTableLabel: function(tableName) {
        var gr = new GlideRecord(this.SYS_DB_OBJECT_TABLE_NAME);
        gr.addQuery(this.SYS_DB_OBJECT_NAME_COLUMN, tableName);
        gr.query();
        if (gr.next()) {
            return gr.getValue(this.SYS_DB_OBJECT_LABEL_COLUMN);
        }
        return null;
    },

    _truncatedLabel: function(tableLabel) {
        if (tableLabel.length > this.TYPE_COLUMN_LENGTH) {
            return tableLabel.substring(0, this.TYPE_COLUMN_LENGTH);
        }
        return tableLabel;
    },

    _getTypeColumnLength: function() {
        var td = GlideTableDescriptor.get(this.CUSTOMER_UPDATES_TABLE_NAME);
        return td.getElementDescriptor(this.TYPE).getLength();
    },

    _matchesTableName: function(tableName, versionRecordName) {
        var tableNamePrefix = tableName + this.UNDERSCORE;
        if (versionRecordName.startsWith(tableNamePrefix)) {
            // Remove the prefix and check if there are any underscores left
            const suffix = versionRecordName.slice(tableNamePrefix.length);
            return !suffix.includes(this.UNDERSCORE);
        }
        return false;
    },

    type: 'SGTScanJob'
};
