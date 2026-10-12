var SOWIncidentInfoSNC = Class.create();
SOWIncidentInfoSNC.prototype = {
    TABLES: {
        SYS_USER_GRMEMBER: 'sys_user_grmember',
        TASK_SLA: 'task_sla',
        SYS_USER: 'sys_user',
        INCIDENT_TASK: 'incident_task',
        SYS_AUDIT: 'sys_audit',
        SYS_JOURNAL_FIELD: 'sys_journal_field',
        INCIDENT: 'incident'
    },
    FIELDS: {
        SOURCE: ['contact_type', 'opened_by']
    },
    //Supported Colors for highlighted value - ("critical" | "high" | "warning" | "moderate" | "positive" | "info" | "low" | "magenta" | "pink" | "orange" | "yellow" | "brown" | "green" | "green-yellow" | "blue" | "gray" | "teal" | "purple")
    FIELD_DETAILS: {
        'priority': {
            'type': 'highlighted-value',
            'color_map': {
                '1': 'orange',
                '2': 'brown',
                '3': 'green-yellow',
                '4': 'blue',
                '5': 'green'
            }
        },
        'default': {
            'type': 'string'
        }
    },
    CONSTANTS: {
        MAX_CONTRIBUTORS: 5,
        INFINITY: Number.POSITIVE_INFINITY
    },

    SUPPORTED_ORIGIN_TABLES: ['change_request', 'em_alert', 'interaction'],

    INTERACTION_STATE: {
        CLOSED_COMPLETE: 'closed_complete',
        CLOSED_ABANDONED: 'closed_abandoned'
    },

    initialize: function(gr) {
        this._gr = gr;
        this._grSysId = gr.getUniqueValue().toString();
        this.sowITSMHighlightedColorUtil = new sn_sow_itsm_common.SOWITSMHighlightedColorUtils();

    },
    getRecordInfo: function() {
        var result = {};
        result.headerInfo = this.getHeaderInfo();
        result.sourceHeading = gs.getMessage('Origin');
        result.sourceInfo = this.getSourceInfo();
        result.assignedUserInfo = this.getAssignedUserInfo();
        result.callerHeadingInfo = this.getCallerHeadingInfo();
        result.slaConfig = this.getSLAConfig();
        result.slaInfo = this.getSlaInfo();
        result.incidentInfo = this.getIncidentAssignmentInfo();
        result.loggedInUserGroup = this.getLoggedInUserGroup();
        result.isMajorIncident = this.isMajorIncident();
        if (result.isMajorIncident) {
            result.mimDuration = this.getMIMDuration();
        }
        return result;
    },

    getMIMDuration: function() {
        var resolvedAt = this._gr.getDisplayValue("resolved_at");
        var createdAt = this._gr.getDisplayValue("sys_created_on");
        var createdAtGdt = new GlideDateTime();
        createdAtGdt.setDisplayValue(createdAt);
        res = {
            "time": "",
            "increment": ""
        };
        if (!gs.nil(resolvedAt)) {
            var resolvedAtGdt = new GlideDateTime();
            resolvedAtGdt.setDisplayValue(resolvedAt);
            res.time = resolvedAtGdt.getNumericValue() - createdAtGdt.getNumericValue();
            res.increment = false;
        } else {
            res.time = createdAtGdt.getNumericValue();
            res.increment = true;
        }
        return res;
    },

    getAllContributors: function() {
        var result = {};
        result.contributorsInfo = this.getContributorsInfo(this.CONSTANTS.INFINITY);
        return result;
    },
    getHeaderInfo: function() {
        var result = {};
        result.mainHeading = gs.getMessage('Record Information');
        var userGr = new GlideRecord(this.TABLES.SYS_USER);
        userGr.addActiveQuery();
        userGr.addQuery("user_name", this._gr.getDisplayValue('sys_updated_by'));
        userGr.query();
        if (userGr.next() && userGr.getValue('name'))
            var updatedBy = userGr.getValue('name');
        else
            updatedBy = this._gr.getDisplayValue('sys_updated_by');
        result.updateMsg = gs.getMessage("Last updated by {0}", updatedBy);
        result.updatedTime = this._gr.sys_updated_on.getDisplayValue();
        return result;
    },
    getFieldsInfo: function(fields) {
        var result = [];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var value = this._gr.getDisplayValue(field);
            if (value) {
                var item = {};
                item.label = this._gr[field].getLabel();
                item.value = {};
                item.value.type = this.FIELD_DETAILS[field] ? this.FIELD_DETAILS[field]['type'] : this.FIELD_DETAILS['default']['type'];
                if (item.value.type == 'highlighted-value') {
                    item.value.label = value;
                    item.value.status = this.FIELD_DETAILS[field]['color_map'][this._gr.getValue(field)];
                } else {
                    item.value.value = value;
                }
                result.push(item);
            }
        }
        return result;
    },
    getSourceInfo: function() {
        var result = {};
        result.showCallerInfo = false;
        result.showOriginInfo = false;
        if (!gs.nil(this._gr.caller_id)) {
            result.showCallerInfo = true;
            result.callerInfo = this.getCallerInfo();
        }
        if (!gs.nil(this._gr.opened_for && this._gr.getTableName() == 'interaction')) {
            result.showCallerInfo = true;
            result.callerInfo = this.getCallerInfo();
        }
        if (!gs.nil(this._gr.origin_table) && (this.SUPPORTED_ORIGIN_TABLES.indexOf(this._gr.origin_table.toString()) != -1)) {
            result.showOriginInfo = true;
            result.originInfo = this.getOriginInfo();
        }
        return result;
    },
    getCallerInfo: function() {
        var result = {};
        var caller = {};
        var callerRef;
        if (this._gr.getTableName() == 'interaction')
            callerRef = this._gr.opened_for.getRefRecord();
        else
            callerRef = this._gr.caller_id.getRefRecord();

        caller.sysId = callerRef.getUniqueValue();
        caller.avatar = callerRef.avatar ? "/" + callerRef.avatar + ".iix?t=small" : "";
        if (this._gr.getTableName() == 'interaction')
            caller.name = this._gr.getDisplayValue("opened_for");
        else
            caller.name = this._gr.getDisplayValue("caller_id");

        caller.timeZone = gs.getProperty('glide.sys.default.tz') || 'America/Los_Angeles';
        caller.timeZoneValue = gs.getProperty('glide.sys.default.tz') || 'America/Los_Angeles';
        if (callerRef.title)
            caller.title = callerRef.getDisplayValue("title");
        if (callerRef.department)
            caller.department = callerRef.getDisplayValue("department");
        var locationRef = callerRef.location.getRefRecord();
        if (locationRef && locationRef.city)
            caller.city = locationRef.getDisplayValue("city");
        if (callerRef.time_zone) {
            caller.timeZone = callerRef.getDisplayValue("time_zone");
            caller.timeZoneValue = callerRef.getValue("time_zone");
        }
        if (callerRef.vip)
            caller.vip = [{
                "label": gs.getMessage("VIP"),
                "color": "critical"
            }];
        result.caller = caller;
        if (this._gr.getTableName() == 'interaction')
            result.fieldsInfo = this.getFieldsInfo(this.FIELDS.SOURCE);
        else
            result.secondaryInfo = this.getFieldsInfo(this.FIELDS.SOURCE);
        return result;
    },
    getOriginInfo: function() {
        var result = {
            actions: null,
            content: null,
            dialog: {
                "isHidden": true
            },
            workNotes: {
                "isHidden": true
            },
            footerContent: [],
            table: this._gr.origin_table + '',
            sysId: this._gr.origin_id + ''
        };
        var originGr = new GlideRecord(this._gr.origin_table);
        if (originGr.get(this._gr.origin_id)) {
            if (this._gr.origin_table == "change_request") {
                result.content = [];
                if (!gs.nil(originGr.number))
                    result.content.push({
                        "label": originGr.number.getLabel(),
                        "value": {
                            "type": "text-link",
                            "label": originGr.getDisplayValue("number"),
                            "href": "javascript:void(0)",
                            "data": {
                                "table": originGr.getTableName(),
                                "sysId": originGr.getUniqueValue()
                            }
                        }
                    });
                if (!gs.nil(originGr.risk)) {
                    var color = this.sowITSMHighlightedColorUtil.getHighlightedColor(originGr, 'risk');
                    var displayValue = originGr.getDisplayValue("risk");
                    var label = originGr.risk.getLabel();
                    var pair = {
                        "label": label,
                        "value": displayValue
                    };
                    if (!gs.nil(color)) {
                        color.label = displayValue;
                        color.type = "highlighted-value";
                        color.status = color.color;
                        pair.value = color;
                    }
                    result.content.push(pair);
                }
                if (!gs.nil(originGr.state)) {
                    color = this.sowITSMHighlightedColorUtil.getHighlightedColor(originGr, 'state');
                    displayValue = originGr.getDisplayValue("state");
                    label = originGr.state.getLabel();
                    pair = {
                        "label": label,
                        "value": displayValue
                    };
                    if (!gs.nil(color)) {
                        color.label = displayValue;
                        color.type = "highlighted-value";
                        color.status = color.color;
                        pair.value = color;
                    }
                    result.content.push(pair);
                }
                if (!gs.nil(originGr.cmdb_ci)) {
                    result.content.push({
                        "label": originGr.cmdb_ci.getLabel(),
                        "value": {
                            "type": "text-link",
                            "label": originGr.getDisplayValue("cmdb_ci"),
                            "href": "javascript:void(0)",
                            "data": {
                                "table": "cmdb_ci",
                                "sysId": originGr.getValue("cmdb_ci")
                            }
                        }
                    });
                }
                if (!gs.nil(originGr.assignment_group))
                    result.content.push({
                        "label": originGr.assignment_group.getLabel(),
                        "value": originGr.getDisplayValue("assignment_group")
                    });
                if (!gs.nil(originGr.assigned_to))
                    result.content.push({
                        "label": originGr.assigned_to.getLabel(),
                        "value": originGr.getDisplayValue("assigned_to")
                    });
                if (!gs.nil(originGr.opened_by))
                    result.content.push({
                        "label": originGr.opened_by.getLabel(),
                        "value": originGr.getDisplayValue("opened_by")
                    });
                if (!gs.nil(originGr.type))
                    result.content.push({
                        "label": originGr.type.getLabel(),
                        "value": originGr.getDisplayValue("type")
                    });
                if (!gs.nil(originGr.short_description))
                    result.footerContent.push({
                        "label": originGr.short_description.getLabel(),
                        "value": originGr.getDisplayValue("short_description")
                    });
            } else if (this._gr.origin_table == "em_alert") {
                result.content = [];
                if (!gs.nil(originGr.number))
                    result.content.push({
                        "label": originGr.number.getLabel(),
                        "value": {
                            "type": "text-link",
                            "label": originGr.getDisplayValue("number"),
                            "href": "javascript:void(0)",
                            "data": {
                                "table": originGr.getTableName(),
                                "sysId": originGr.getUniqueValue()
                            }
                        }
                    });
                if (!gs.nil(originGr.sn_priority_group)) {
                    color = this.sowITSMHighlightedColorUtil.getHighlightedColor(originGr, 'sn_priority_group');
                    displayValue = originGr.getDisplayValue("sn_priority_group");
                    label = originGr.sn_priority_group.getLabel();
                    pair = {
                        "label": label,
                        "value": displayValue
                    };
                    if (!gs.nil(color)) {
                        color.label = displayValue;
                        color.type = "highlighted-value";
                        color.status = color.color;
                        pair.value = color;
                    }
                    result.content.push(pair);
                }
                if (!gs.nil(originGr.severity)) {
                    color = this.sowITSMHighlightedColorUtil.getHighlightedColor(originGr, 'severity');
                    displayValue = originGr.getDisplayValue("severity");
                    label = originGr.severity.getLabel();
                    pair = {
                        "label": label,
                        "value": displayValue
                    };
                    if (!gs.nil(color)) {
                        color.label = displayValue;
                        color.type = "highlighted-value";
                        color.status = color.color;
                        pair.value = color;
                    }
                    result.content.push(pair);
                }
                if (!gs.nil(originGr.cmdb_ci)) {
                    result.content.push({
                        "label": originGr.cmdb_ci.getLabel(),
                        "value": {
                            "type": "text-link",
                            "label": originGr.getDisplayValue("cmdb_ci"),
                            "href": "javascript:void(0)",
                            "data": {
                                "table": "cmdb_ci",
                                "sysId": originGr.getValue("cmdb_ci")
                            }
                        }
                    });
                }
                if (originGr.source == "DEX") {
                    if (GlidePluginManager.isActive("com.sn_dex")) { // Check if DEX app is installed
                        var impactedResult = new sn_dex.DEXAlertImpactedUsersUtils().getImpactedUsersAndDevices(originGr.sys_id);
                        if (impactedResult && impactedResult[0] && impactedResult[0]["count"])
                            result.content.push({
                                "label": gs.getMessage("Impacted users"),
                                "value": impactedResult[0]["count"]
                            });
                        if (impactedResult && impactedResult[1] && impactedResult[1]["count"])
                            result.content.push({
                                "label": gs.getMessage("Impacted devices"),
                                "value": impactedResult[1]["count"]
                            });
                    }
                }
                if (!gs.nil(originGr.description))
                    result.footerContent.push({
                        "label": originGr.description.getLabel(),
                        "value": originGr.getDisplayValue("description")
                    });
            } else if (this._gr.origin_table == "interaction") {
                result.content = [];
                result.workNotes.isHidden = false;
                if (!gs.nil(originGr.state)) {
                    result.dialog.state = originGr.getValue("state");
                    var isTypeChat = originGr.getValue("type") == "chat";
                    var isChatCompleted = (result.dialog.state == this.INTERACTION_STATE.CLOSED_COMPLETE || result.dialog.state == this.INTERACTION_STATE.CLOSED_ABANDONED);
                    if (isTypeChat && isChatCompleted) {
                        result.dialog.isHidden = false;
                    }

                    color = this.sowITSMHighlightedColorUtil.getHighlightedColor(originGr, 'state');
                    displayValue = originGr.getDisplayValue("state");
                    label = originGr.state.getLabel();
                    pair = {
                        "label": label,
                        "value": displayValue
                    };
                    if (!gs.nil(color)) {
                        color.label = displayValue;
                        color.type = "highlighted-value";
                        color.status = color.color;
                        pair.value = color;
                    }
                    result.content.push(pair);
                }


                if (!gs.nil(originGr.number)) {
                    result.dialog.transcriptDialogHeading = gs.getMessage('{0} Chat transcript', originGr.getDisplayValue("number"));
                    result.dialog.activityDialogHeading = gs.getMessage('{0} Work notes', originGr.getDisplayValue("number"));
                    result.dialog.number = originGr.getDisplayValue("number");
                    result.dialog.updated_on = gs.getMessage('Updated {0}', originGr.getDisplayValue("sys_updated_on"));

                    result.content.push({
                        "label": originGr.number.getLabel(),
                        "value": {
                            "type": "text-link",
                            "label": originGr.getDisplayValue("number"),
                            "href": "javascript:void(0)",
                            "data": {
                                "table": originGr.getTableName(),
                                "sysId": originGr.getUniqueValue()
                            }
                        }
                    });

                }

                if (!gs.nil(originGr.assigned_to)) {
                    result.content.push({
                        "label": originGr.assigned_to.getLabel(),
                        "value": originGr.getDisplayValue("assigned_to")
                    });
                }
                if (!gs.nil(originGr.opened_by))
                    result.content.push({
                        "label": originGr.opened_by.getLabel(),
                        "value": originGr.getDisplayValue("opened_by")
                    });
                if (!gs.nil(originGr.type))
                    result.content.push({
                        "label": originGr.type.getLabel(),
                        "value": originGr.getDisplayValue("type")
                    });
                if (!gs.nil(originGr.short_description)) {
                    result.dialog.short_description = originGr.getDisplayValue("short_description");
                    result.footerContent.push({
                        "label": originGr.short_description.getLabel(),
                        "value": originGr.getDisplayValue("short_description")
                    });
                }
                if (!gs.nil(originGr.duration)) {
                    result.dialog.caption = gs.getMessage('Chat duration {0} | Updated {1}', [originGr.getDisplayValue("duration"), originGr.getDisplayValue("sys_updated_on")]);
                }
                if (!result.dialog.isHidden) {
                    result.dialog.internal_transcript = {
                        "label": originGr.internal_transcript.getLabel(),
                        "value": originGr.internal_transcript.getDisplayValue(),
                        "textarea": {
                            "aria-label": originGr.internal_transcript.getLabel()
                        }
                    };
                }
            }
        }
        return result;
    },
    isMemberOfGroup: function(userId, groupId) {
        if (!groupId || !userId)
            return false;
        var groupGr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        groupGr.addQuery('group.active', 'true');
        groupGr.addQuery('group', groupId);
        groupGr.addQuery('user', userId);
        groupGr.query();
        return groupGr.hasNext();
    },
    getMemberGroup: function(userId) {
        if (!userId)
            return '';
        var groupGr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        groupGr.addQuery('group.active', 'true');
        groupGr.addQuery('user', userId);
        groupGr.setLimit(1);
        groupGr.query();
        if (groupGr.next()) {
            return groupGr.group.getDisplayValue();
        }
        return '';
    },
    getAssignedUserInfo: function() {
        var result = {};
        if (this._gr.getTableName() == 'incident') {
            result.isAssignedToFilled = true;
            result.hideEmptyState = true;
            result.emptyStateMsg = gs.getMessage("This Incident has not been assigned yet");
            result.showAssignButton = Boolean(this._gr.active) && this._gr.canWrite() && this._gr.assignment_group.canWrite() && this._gr.assigned_to.canWrite();
            result.subHeading = this._gr.assigned_to.getLabel();
            if (!this._gr.assigned_to) {
                result.isAssignedToFilled = false;
                result.hideEmptyState = false;
                return result;
            }
            var assignedUserRef = this._gr.assigned_to.getRefRecord();
            result.avatar = assignedUserRef.avatar ? "/" + assignedUserRef.avatar + ".iix?t=small" : "";
            result.name = this._gr.getDisplayValue("assigned_to");
            if (this._gr.assignment_group && this.isMemberOfGroup(this._gr.assigned_to, this._gr.assignment_group)) {
                result.group = [{
                    "label": this._gr.getDisplayValue("assignment_group")
                }];
            } else {
                var group = this.getMemberGroup(this._gr.assigned_to);
                result.group = group ? [{
                    "label": group
                }] : [];
            }
            return result;
        }
    },
    getCallerHeadingInfo: function() {
        var result = {};
        var callerHeading;
        if (this._gr.getTableName() == 'interaction')
            result.callerHeading = this._gr['opened_for'].getLabel();
        else if (this._gr.getTableName() == 'incident')
            result.callerHeading = this._gr['caller_id'].getLabel();
        return result;
    },
    getSLAConfig: function() {
        var config = [{
                "configId": "af871ab3532730102d05ddeeff7b124f",
                "slaTimerLabel": gs.getMessage("Response SLA")
            },
            {
                "configId": "aca7d6b3532730102d05ddeeff7b12ec",
                "slaTimerLabel": gs.getMessage("Resolution SLA")
            }
        ];
        return config;
    },
    getSlaInfo: function() {
        var result = {};
        var aggGr = new GlideAggregate(this.TABLES.TASK_SLA);
        aggGr.addQuery('task', this._grSysId);
        aggGr.addAggregate("COUNT");
        aggGr.query();
        result.count = 0;
        if (aggGr.next()) {
            result.count = aggGr.getAggregate('COUNT');
            result.buttonText = gs.getMessage("View all SLAs");
            result.query = aggGr.getEncodedQuery();
        }
        result.listTitle = gs.getMessage("Task SLAs");
        return result;
    },
    getContributorsInfo: function(maxContributors) {
        var contributorsList = [];
        var arrayUtil = new global.ArrayUtil();
        var incidentTaskGr = new GlideAggregate(this.TABLES.INCIDENT_TASK);
        var table = this._gr.getTableName();
        incidentTaskGr.addQuery(this.TABLES.INCIDENT, this._grSysId);
        incidentTaskGr.addNotNullQuery('assigned_to');
        if (maxContributors != this.CONSTANTS.INFINITY) {
            incidentTaskGr.setLimit(maxContributors);
        }
        incidentTaskGr.groupBy("assigned_to");
        incidentTaskGr.query();
        while (incidentTaskGr.next() && contributorsList.length < maxContributors) {
            if (incidentTaskGr.getValue('assigned_to') != this._gr.assigned_to && !arrayUtil.contains(contributorsList, incidentTaskGr.getValue('assigned_to'))) {
                if (incidentTaskGr.getValue('assigned_to')) {
                    contributorsList.push(incidentTaskGr.getValue('assigned_to'));
                }
            }
        }
        if (contributorsList.length < maxContributors) {
            var sysAuditGr = new GlideAggregate(this.TABLES.SYS_AUDIT);
            sysAuditGr.addQuery('tablename', this.TABLES.INCIDENT);
            sysAuditGr.addQuery('documentkey', this._grSysId);
            sysAuditGr.addQuery('fieldname', 'assigned_to');
            sysAuditGr.addNotNullQuery('oldvalue');
            if (maxContributors != this.CONSTANTS.INFINITY) {
                sysAuditGr.setLimit(maxContributors);
            }
            sysAuditGr.groupBy("oldvalue");
            sysAuditGr.query();
            while (sysAuditGr.next() && contributorsList.length < maxContributors) {
                if (sysAuditGr.getValue('oldvalue') != this._gr.assigned_to && !arrayUtil.contains(contributorsList, sysAuditGr.getValue('oldvalue'))) {
                    contributorsList.push(sysAuditGr.getValue('oldvalue'));
                }
            }
        }
        if (contributorsList.length < maxContributors && table == this.TABLES.INCIDENT) {
            var collaboratorsInWorknotes = [];
            var collabGr = new GlideAggregate(this.TABLES.SYS_JOURNAL_FIELD);
            collabGr.addQuery('element', 'IN', 'work_notes, comments');
            collabGr.addQuery('name', table);
            collabGr.addQuery('element_id', this._grSysId);
            collabGr.groupBy("sys_created_by");
            if (maxContributors != this.CONSTANTS.INFINITY) {
                collabGr.setLimit(maxContributors);
            }
            collabGr.query();
            while (collabGr.next()) {
                var user = collabGr.getValue("sys_created_by");
                if (!arrayUtil.contains(collaboratorsInWorknotes, user)) {
                    collaboratorsInWorknotes.push(user);
                }
            }
            var worknoteUsers = this.getSysidFromUserName(collaboratorsInWorknotes);
            for (var ind = 0; ind < worknoteUsers.length && contributorsList.length < maxContributors; ind++) {
                if (!arrayUtil.contains(contributorsList, worknoteUsers[ind]) && worknoteUsers[ind] != this._gr.assigned_to) {
                    contributorsList.push(worknoteUsers[ind]);
                }
            }
        }
        if (contributorsList.length < maxContributors) {
            var collaboratorsList = new sn_sow.SOWCollabInfo().getCollaboratorsInfo(this.TABLES.INCIDENT, this._grSysId);
            for (var j = 0; j < collaboratorsList.length && contributorsList.length < maxContributors; j++) {
                if (!arrayUtil.contains(contributorsList, collaboratorsList[j]) && collaboratorsList[j] != this._gr.assigned_to)
                    contributorsList.push(collaboratorsList[j]);
            }
        }
        var userInfo = this.getUserInfo(contributorsList);
        return userInfo;
    },
    getUserInfo: function(userIds) {
        var results = [];
        var userGr = new GlideRecord(this.TABLES.SYS_USER);
        userGr.addQuery('sys_id', 'IN', userIds.join(","));
        userGr.query();
        while (userGr.next()) {
            results.push({
                sys_id: userGr.getUniqueValue(),
                avatar: userGr.getValue('avatar') ? "/" + userGr.getValue('avatar') + ".iix?t=small" : "",
                userDisplayValue: userGr.getDisplayValue(),
                title: userGr.getValue("title")
            });
        }
        return results;
    },
    getSysidFromUserName: function(userNames) {
        var collaborators = [];
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('user_name', 'IN', userNames.join(","));
        userGr.query();
        while (userGr.next()) {
            collaborators.push(userGr.getValue("sys_id"));
        }
        return collaborators;
    },
    getIncidentAssignmentInfo: function() {
        var result = {};
        result.assignmentGroup = this._gr.getValue("assignment_group");
        result.assignedTo = this._gr.getValue("assigned_to");
        result.canWrite = this._gr.canWrite();
        return result;
    },
    getLoggedInUserGroup: function() {
        var result = [];
        var groupGr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        groupGr.addQuery('group.active', 'true');
        groupGr.addQuery('user', gs.getUserID());
        groupGr.query();
        while (groupGr.next()) {
            result.push({
                displayValue: groupGr.group.getDisplayValue(),
                value: groupGr.getValue('group')
            });
        }
        return result;
    },
    isMajorIncident: function() {
        var miState = this._gr.getValue('major_incident_state');
        return miState && miState == 'accepted';
    },

    type: 'SOWIncidentInfoSNC'
};
