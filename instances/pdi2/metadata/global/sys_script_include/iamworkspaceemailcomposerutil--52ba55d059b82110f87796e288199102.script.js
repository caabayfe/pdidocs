var IAMWorkspaceEmailComposerUtil = Class.create();
IAMWorkspaceEmailComposerUtil.DEBUG_LOG = 'com.snc.iam.workspace.email_client_log';
IAMWorkspaceEmailComposerUtil.prototype = {
    initialize: function(emailDraftGR) {
        this.emailDraftGR = emailDraftGR;
        this.commManagementUtils = new sn_comm_management.CommunicationManagementUtil();
        this._log = new GSLog(IAMWorkspaceEmailComposerUtil.DEBUG_LOG, this.type);
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.logDebug("[initialize]");
    },

    TABLES: {
        INCIDENT_ALERT_TASK: 'incident_alert_task',
        SYS_USER: 'sys_user',
        SYS_USER_GROUP: 'sys_user_group',
        SYS_EMAIL_DRAFT_RECIPIENT: 'sys_email_draft_recipient',
        SN_PUBLICATIONS_RECIPIENTS_LIST: 'sn_publications_recipients_list'
    },

    COLUMNS: {
        TARGET_TABLE: 'target_table',
        TARGET_RECORD: 'target_record',
        EMAIL: 'email',
        EMAIL_ADDRESS: 'email_address',
        NAME: 'name',
        RECIPIENT_SOURCE: 'recipient_source',
        RECIPIENT_SOURCE_TABLE: 'recipient_source_table',
        EMAIL_DRAFT: 'email_draft',
        RECIPIENT_TYPE: 'recipient_type',
        DISPLAY_NAME: 'display_name'
    },

    CONSTANTS: {
        USER_GROUP: 'user-group',
        RECIPIENT_LIST: 'recipient-list'
    },

    PROPERTIES: {
        ALLOWED_WORKSPACE: 'com.snc.iam.allowed_workspaces'
    },

    /**
     * @caution (DO NOT CREATE OR UPDATE THE BELOW PROPERTY)
     * 
     * 
     * @function _getAllowedWorkspaces - Private function to get the allowed workspaces to execute the Business rule
     * 
     * @returns - allowed workspace in string or regex format
     */
    _getAllowedWorkspaces: function() {
        return gs.getProperty(this.PROPERTIES.ALLOWED_WORKSPACE, '/now/sow/');
    },

    /**
     * @function hasAccess - Check if the Target Table is incident_alert_task, and workspace is allowed.
     * 
     * @returns Boolean
     */
    hasAccess: function() {
        if (this.emailDraftGR && this.emailDraftGR.isValidRecord()) {
            var allowedWorkspaces = this._getAllowedWorkspaces();
            var referer = GlideTransaction.get().getRequest().getHeader("referer");
            var validWorkspaces = referer.match(allowedWorkspaces);
            return (this.emailDraftGR.getValue(this.COLUMNS.TARGET_TABLE) == this.TABLES.INCIDENT_ALERT_TASK) &&
                (validWorkspaces != null && validWorkspaces.length != 0);
        }
        return false;
    },

    /**
     * @function getChannelsPerTask
     * 
     * @returns respData Object - Object containing the email recipients, groups and recipient lists
     */
    getChannelsPerTask: function() {
        if (this.hasAccess()) {
            var respData = {
                    expandGroupsAndRecipients: false
                },
                channels = [];

            var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(this.emailDraftGR.getValue(this.COLUMNS.TARGET_TABLE));
            var commTaskGR = new GlideRecord(handlerInstance.getCommTaskInstanceForTask());
            if (commTaskGR.get(this.emailDraftGR.getValue(this.COLUMNS.TARGET_RECORD))) {
                var channelGr = new GlideRecord(this.commManagementUtils.TABLES.COMM_CHANNEL);
                channelGr.addQuery(this.commManagementUtils.COLUMNS.COMM_TASK, commTaskGR.getUniqueValue());
                channelGr.query();
                while (channelGr.next())
                    channels.push(channelGr.comm_channel_config.type + '');
                var channelMap = this.commManagementUtils.getChannelMap(this.emailDraftGR.getValue(this.COLUMNS.TARGET_TABLE), channels);
                for (var channel in channelMap) {
                    if (channelMap[channel].classification != this.commManagementUtils.CHANNEL_CLASSIFICATIONS.UPDATE)
                        continue;
                    if (channelMap[channel].available)
                        this.commManagementUtils.prepareDataForCommunication(channelMap[channel], commTaskGR, respData);
                }
            }
            if (this._log.atLevel(GSLog.DEBUG))
                this._log.logDebug("[ChannelsPerTask] " + JSON.stringify(respData));
            return respData;
        }
        return {};
    },

    /**
     * @function _getUserWithEmail
     * 
     * @param email string - email address to get the user record if present
     * 
     * @returns userGR GlideRecord - user record if present or null
     */
    _getUserWithEmail: function(email) {
        if (gs.nil(email))
            return null;
        var userGR = new GlideRecord(this.TABLES.SYS_USER);
        if (userGR.get(this.COLUMNS.EMAIL, email))
            return userGR;
        return null;
    },

    /**
     * @function _getRecordBySysID
     * 
     * @param table string - Table Name
     * @param sysId string - SysID of the record
     * 
     * @returns recordGR GlideRecord - GlideRecord of the table if present or null
     */
    _getRecordBySysID: function(table, sysId) {
        if (gs.nil(table) || gs.nil(sysId) || !gs.tableExists(table))
            return null;
        var recordGR = new GlideRecord(table);
        if (recordGR.get(sysId))
            return recordGR;
        return null;
    },

    /**
     * @function addDraftRecipients - Get's the email recipients to insert the records into sys_email_draft_recipients
     */
    addDraftRecipients: function() {
        if (this.hasAccess()) {
            var data = this.getChannelsPerTask();
            if (typeof data == 'string')
                data = JSON.parse(data);

            if (data && data.email && data.email.available) {
                var hasRecipients = (!gs.nil(data.email.recipients) || data.email.recipientLists.length != 0 || data.email.groups.length != 0);
                if (hasRecipients) {
                    var recipientField = data[this.COLUMNS.EMAIL].recipient_field;
                    var recipients = data[this.COLUMNS.EMAIL].recipients;
                    if (!gs.nil(recipients)) {
                        recipients = this._getUniqueValuesFromArray(recipients.split(','));
                        recipients.forEach(function(recipient) {
                            this._addEmailDraftRecipient({
                                recipient: recipient,
                                recipientField: recipientField,
                                draftSysID: this.emailDraftGR.getUniqueValue()
                            }, this.CONSTANTS.USER_GROUP);
                        }, this);
                    }
                    data[this.COLUMNS.EMAIL].recipientLists.forEach(function(recipientList) {
                        this._addEmailDraftRecipient({
                            recipient: '',
                            recipientField: recipientField,
                            draftSysID: this.emailDraftGR.getUniqueValue(),
                            sysId: recipientList.sys_id,
                            displayValue: recipientList.display_value || ''
                        }, this.CONSTANTS.RECIPIENT_LIST);

                    }, this);
                    var groups = this._getUniqueValuesFromArray(data[this.COLUMNS.EMAIL].groups);
                    groups.forEach(function(group) {
                        this._addEmailDraftRecipient({
                            recipient: '',
                            recipientField: recipientField,
                            draftSysID: this.emailDraftGR.getUniqueValue(),
                            sysId: group,
                            displayValue: ''
                        }, this.CONSTANTS.RECIPIENT_LIST);
                    }, this);
                }
            }
        }
    },

    /**
     * @function _getUniqueValuesFromArray - Private function to get the unique elements from a conventional array
     *                                       This function uses hash technique to return unique elements and 
     *                                       has a time complexity of O(n) since it will only loop once.
     * 
     * @param arr Array - Array of elements
     * 
     * @returns output - Array with unique elements
     */
    _getUniqueValuesFromArray: function(arr) {
        var output = {},
            val;
        for (var i = 0; i < arr.length; i++) {
            val = arr[i].trim();
            if (!gs.nil(val))
                output[val] = true;
        }
        return Object.keys(output);
    },

    /**
     * @function _addEmailDraftRecipient - Private function to implement the insert of records into the sys_email_draft_recipients
     * 
     * @param recipientObj Object - Recipient object containing information to add data to sys_email_draft_recipients record
     * @param type String - Type of the recipient (user-group, recipient-list)
     */
    _addEmailDraftRecipient: function(recipientObj, type) {
        var recipientEmail = recipientObj.recipient;
        var recipientSysId = recipientObj.sysId;
        if (type == this.CONSTANTS.USER_GROUP && gs.nil(recipientEmail))
            return;
        else if (type == this.CONSTANTS.RECIPIENT_LIST && gs.nil(recipientSysId))
            return;
        var emailDraftRecipientGR = new GlideRecord(this.TABLES.SYS_EMAIL_DRAFT_RECIPIENT);
        if (!gs.nil(recipientEmail))
            emailDraftRecipientGR.setValue(this.COLUMNS.EMAIL_ADDRESS, recipientEmail);
        emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_TYPE, recipientObj.recipientField);
        emailDraftRecipientGR.setValue(this.COLUMNS.EMAIL_DRAFT, recipientObj.draftSysID);
        var displayName = recipientEmail;
        if (type == this.CONSTANTS.USER_GROUP) {
            var userGR = this._getUserWithEmail(recipientEmail);
            if (!gs.nil(userGR) && userGR.isValidRecord()) {
                emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE, userGR.getUniqueValue());
                emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE_TABLE, userGR.getTableName());
                displayName = userGR.getValue(this.COLUMNS.NAME);
            } else {
                var groupGR = new GlideRecord(this.TABLES.SYS_USER_GROUP);
                groupGR.addQuery(this.COLUMNS.EMAIL, recipientEmail);
                groupGR.query();
                if (groupGR.next()) {
                    emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE, groupGR.getUniqueValue());
                    emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE_TABLE, groupGR.getTableName());
                    displayName = groupGR.getValue(this.COLUMNS.NAME);
                }
            }
        } else if (type == this.CONSTANTS.RECIPIENT_LIST) {
            var groupGr = this._getRecordBySysID(this.TABLES.SYS_USER_GROUP, recipientSysId);
            if (!gs.nil(groupGr) && groupGr.isValidRecord()) {
                emailDraftRecipientGR.setValue(this.COLUMNS.EMAIL_ADDRESS, groupGr.getValue(this.COLUMNS.EMAIL));
                emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE, recipientSysId);
                emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE_TABLE, this.TABLES.SYS_USER_GROUP);
                displayName = recipientObj.displayValue || groupGr.getValue(this.COLUMNS.NAME);
            } else {
                var recipientListGR = this._getRecordBySysID(this.TABLES.SN_PUBLICATIONS_RECIPIENTS_LIST, recipientSysId);
                if (!gs.nil(recipientListGR) && recipientListGR.isValidRecord()) {
                    emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE, recipientSysId);
                    emailDraftRecipientGR.setValue(this.COLUMNS.RECIPIENT_SOURCE_TABLE, this.TABLES.SN_PUBLICATIONS_RECIPIENTS_LIST);
                    displayName = recipientObj.displayValue || recipientListGR.getValue(this.COLUMNS.NAME);
                }
            }
        }
        emailDraftRecipientGR.setValue(this.COLUMNS.DISPLAY_NAME, displayName);
        emailDraftRecipientGR.insert();
    },

    type: 'IAMWorkspaceEmailComposerUtil'
};
