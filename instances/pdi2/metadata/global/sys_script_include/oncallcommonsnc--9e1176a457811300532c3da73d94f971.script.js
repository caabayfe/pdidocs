var OnCallCommonSNC = Class.create();

OnCallCommonSNC.COMMUNICATION_TYPES = {
    EMAIL: 'email',
    SMS: 'sms',
    VOICE: 'voice',
    SLACK: 'slack',
    TASK: 'task',
    MOBILE_NOTIFICATION: 'mobile_notification',
    TEAMS: 'teams',
    CONFERENCE_ESCALATION: 'conference_escalation'
};

OnCallCommonSNC.COMMUNICATION_TYPE_LABELS = {
    EMAIL: gs.getMessage('E-mail'),
    SMS: gs.getMessage('SMS'),
    VOICE: gs.getMessage('Voice'),
    SLACK: gs.getMessage('Slack'),
    TASK: gs.getMessage('Task'),
    TEAMS: gs.getMessage('Microsoft Teams'),
    CONFERENCE_ESCALATION: gs.getMessage('Conference escalation')
};

OnCallCommonSNC.TEAMS_NOTIFICATION_ACTION_IDENTIFIER = 'com.snc.on_call_rotation';
OnCallCommonSNC.TEAMS_NOTIFICATION_PROCESSOR = 'sn_now_teams';
OnCallCommonSNC.TEAMS_PROVIDER_NAME = 'Microsoft Teams';

OnCallCommonSNC.MOBILE_PUSH_NOTIFICATION = 'Mobile push notification';

OnCallCommonSNC.prototype = {
    initialize: function() {
        this.escalation_rule_rota_overlap = {
            START: 'start',
            END: 'end',
            ALL: 'all'
        };
        this.TABLES = {
            CMN_ROTA: 'cmn_rota',
            CMN_ROTA_MEMBER: 'cmn_rota_member',
            CMN_ROTA_ROSTER: 'cmn_rota_roster',
            CMN_SCHEDULE: 'cmn_schedule',
            SYS_USER_GRMEMBER: 'sys_user_grmember',
            USER: 'sys_user',
            SYS_CHOICE: 'sys_choice',
            SYS_UI_ACTION: 'sys_ui_action',
            SYS_CS_PROVIDER_APPLICATION: 'sys_cs_provider_application',
            SYS_CONNECTION: "sys_connection",
            ON_CALL_COMMUNICATION_TYPE: "on_call_communication_type",
            ON_CALL_ESCALATION_COMM: "on_call_escalation_comm",
            ON_CALL_USER_CONTACT_PREFERENCE: "on_call_user_contact_preference"
        };

        this.DEFAULT_LANGUAGE_CODES = {
            en: 'en-US',
            es: 'es-ES',
            fr: 'fr-FR',
            pt: 'pt-PT',
            zh: 'zh-CN'
        };

        this.SYS_USER_FIELDS = {
            TIMEZONE: "time_zone"
        };

        this.CATCH_ALL_WAIT_TIME_PROPERTY = "com.snc.on_call_rotation.catch_all_wait_time";

        this.NOTIFY_DELEGATE_USER_PROPERTY = 'com.snc.on_call_escalation_notification_delegate_user';

        this.SOW_REDIRECTION_ON_CALL_PROPERTY = 'sow_email_notification_redirect.on_call';
    },

    /*
        fetch all communication types 
    */

    getAllCommunicationChannels: function() {
        var communicationTypes = [];
        var gr = new GlideRecord(this.TABLES.ON_CALL_COMMUNICATION_TYPE);
        gr.query();
        while (gr.next()) {
            var typeValue = gr.getValue('type');
            communicationTypes.push(typeValue);
        }
        return communicationTypes;
    },

    /**
     * Constrain a provided encoded query by the start and end dates that concern the query.
     *
     * @param limitedBy [String]
     * @param startDate [String]
     * @param endDate [String]
     * @return [String] encoded query
     **/
    getDateLimitedEncQuery: function(limitedBy, startDate, endDate) {
        var startDateTime = this.formatDateStr(this.getGlideDateTimeStr(false, startDate));
        var endDateTime = this.formatDateStr(this.getGlideDateTimeStr(true, endDate));
        var and = "^";
        var or = "^NQ";
        var startInEndIn = limitedBy + and + "start_date_time>=" + startDateTime + and + "end_date_time<=" + endDateTime;
        var startOutEndIn = limitedBy + and + "start_date_time<=" + startDateTime + and + "end_date_time>=" + startDateTime + and + "end_date_time<=" + endDateTime;
        var startInEndOut = limitedBy + and + "start_date_time>=" + startDateTime + and + "start_date_time<=" + endDateTime + and + "end_date_time>=" + endDateTime;
        var startOutEndOut = limitedBy + and + "start_date_time<=" + startDateTime + and + "end_date_time>=" + endDateTime;
        var repeatNotNull = limitedBy + and + "repeat_type!=null" + and + "repeat_until=00000000^ORrepeat_until=null^ORrepeat_until>=" + startDateTime.split("T")[0];
        var encodedQueryStr = startInEndIn + or + startOutEndIn + or + startInEndOut + or + startOutEndOut + or + repeatNotNull;
        return encodedQueryStr;
    },

    /**
     * @param endOfDay [Boolean]: End of current day.
     * @param date [String]: a string in the yyyy-MM-dd format. A default is applied if not provided which is the start of day, unless endOfDay is true
     * return: yyyy-MM-dd hh:mm:ss [String]
     *
     */
    getGlideDateTimeStr: function(endOfDay, dateStr) {
        var timePart = endOfDay ? " 23:59:59" : " 00:00:00";
        var dateTime = "";

        if (JSUtil.nil(dateStr)) {
            var currentDateTime = new GlideDateTime();
            dateTime = new GlideDateTime(currentDateTime.getDate() + timePart).getValue();
        } else
            dateTime = new GlideDateTime(dateStr + timePart).getValue();

        return dateTime;
    },

    /*
     * Input: yyyy-MM-dd hh:mm:ss
     * Output: yyyyMMddThhmmssZ
     * e.g.
     * 2016-08-02 00:00:00
     * 20160802T000000Z
     */
    formatDateStr: function(strDate) {
        var iCalDate = strDate + "";
        iCalDate = iCalDate.replace(/\s+/g, "T");
        iCalDate = iCalDate.replace(/\-/g, "");
        iCalDate = iCalDate.replace(/\:/g, "");
        iCalDate += "Z"; // Denotes UTC, hence expecting UTC input
        return iCalDate;
    },

    /**
     * Rhino engine parseInt does not behave like JS parseInt dumping floats
     */
    parseInt: function(str) {
        if (!str)
            return 0;
        var number = str.split(".");
        return parseInt(number[0]);
    },

    /**
     * ensure number is at least 2 digits long
     */
    pad: function(number) {
        number = parseInt(number || "");
        if (isNaN(number))
            return "00";
        if (number >= 10)
            return number;
        return "0" + number;
    },

    /**
     * git [GlideIntegerTime]
     * return time hhmmss
     */
    gitToTime: function(git) {
        return (this.pad(git.getHour()) + "") + (this.pad(git.getMinute()) + "") + (this.pad(git.getSecond()) + "");
    },

    /**
     * gd [GlideDate]
     * return time yyyymmdd
     */
    gdToDate: function(gd) {
        return (gd.getYearUTC() + "") + (this.pad(gd.getMonthUTC()) + "") + (this.pad(gd.getDayOfMonthUTC()) + "");
    },

    /**
     * gdt [GlideDateTime]
     * return time yyyymmdd
     */
    gdtToDate: function(gdt) {
        return (gdt.getYearLocalTime() + "") + (this.pad(gdt.getMonthLocalTime()) + "") + (this.pad(gdt.getDayOfMonthLocalTime()) + "");
    },

    /*
     * Check if overlapping shift is allowed for a group
     * @param String groupId
     *
     * @return true if overlapping shift is allowed for a group
     */
    isOverlapAllowed: function(groupId) {
        var onCallGroupPreferenceGR = new GlideRecord("on_call_group_preference");
        var hasGroupPreference = onCallGroupPreferenceGR.get("group", groupId);
        if ((hasGroupPreference && (onCallGroupPreferenceGR.getValue("allow_rota_overlap") === 'yes' || (onCallGroupPreferenceGR.getValue("allow_rota_overlap") === 'default' && gs.getProperty('com.snc.on_call_rotation.allow_rota_overlap') == 'true'))) || (!hasGroupPreference && gs.getProperty('com.snc.on_call_rotation.allow_rota_overlap') == 'true'))
            return true;
        return false;
    },

    getEscalationSettings: function(groupId) {
        var onCallGroupPreferenceGR = new GlideRecord("on_call_group_preference");
        var hasGroupPreference = onCallGroupPreferenceGR.get("group", groupId);
        var escalationSetting;
        if (hasGroupPreference) {
            escalationSetting = onCallGroupPreferenceGR.getValue("escalation_rule_rota_overlap");
            if (escalationSetting == 'default') {
                escalationSetting = gs.getProperty('com.snc.on_call_rotation.escalation_rule_rota_overlap');
            }
        } else {
            escalationSetting = gs.getProperty('com.snc.on_call_rotation.escalation_rule_rota_overlap');
        }
        return escalationSetting;
    },

    toJS: function(gr, requiredFields, skipACL) {
        if (!gr)
            return;
        if (!gr.canRead() && !skipACL)
            return;
        if (!requiredFields)
            requiredFields = [];

        var obj = {};
        obj.sys_id = {};
        obj.sys_id.value = gr.getUniqueValue();

        var el = gr.getFields();
        for (var i = 0; i < el.size(); i++) {
            var elem = el.get(i);
            var elName = elem.getName() + "";
            var fieldType = elem.getED().getInternalType();

            if (requiredFields.indexOf(elName) == -1 || fieldType == 'journal' || fieldType == 'journal_input' || fieldType == 'journal_list')
                continue;

            obj[elName] = {};
            obj[elName].canRead = elem.canRead();
            if (obj[elName].canRead || skipACL) {
                /* This if check is only for a specific condition for on-call edit escalation details, if the sys_users glidelist contains any user with ',' in the userId */
                if (fieldType == 'glide_list' && elem.getTableName() == 'cmn_rota_esc_step_def' && elName == 'sys_users' && elem.toString().split(',').length != elem.getDisplayValue().split(',').length) {
                    var userDisplayValues = [];
                    var userGr = new GlideRecord('sys_user');
                    userGr.addQuery('sys_id', 'IN', elem.toString());
                    userGr.query();
                    while (userGr.next()) {
                        userDisplayValues.push(userGr.getDisplayValue().replaceAll(',', ' '));
                    }

                    obj[elName].value = elem.toString();
                    obj[elName].display_value = userDisplayValues.join(',');
                } else {
                    obj[elName].display_value = elem.getDisplayValue();
                    obj[elName].value = elem.toString();
                }
                obj[elName].label = elem.getLabel();

                if (gr[elName] != null && gr[elName].getGlideObject() && gr[elName]
                    .getGlideObject().getDisplayValueInternal()) {
                    obj[elName].display_value_internal = gr[elName].getGlideObject().getDisplayValueInternal();
                }
            }
        }
        return obj;
    },

    hasActiveRotas: function(groupId) {
        var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
        rotaGr.addActiveQuery();
        rotaGr.addQuery("group", groupId);
        rotaGr.query();
        return rotaGr.hasNext();
    },

    /**
     * @param managerGroupGr [GlideRecord]: sys_user_group's GlideRecord.
     * @param userSysId [String]
     * @param isRotaAdmin [Boolean]
     */
    addManagedGroupsQuery: function(managerGroupGr, userSysId, isRotaAdmin) {
        if (!isRotaAdmin)
            managerGroupGr.addQuery("manager", userSysId);
        managerGroupGr.addActiveQuery();
        managerGroupGr.addEncodedQuery("JOINsys_user_group.sys_id=cmn_rota.group!active=true");
    },

    /*
     * Returns count of users how are active members of any roster from the given group
     */
    getGroupMemberCount: function(groupId, includeDraft) {
        var todayDate = new GlideDateTime().getDate().getValue(); // returns internal formatted date
        var memberGa = new GlideAggregate(this.TABLES.CMN_ROTA_MEMBER);
        memberGa.addQuery("member.active", "=", true);
        var qc = memberGa.addQuery("roster.rota.active", true);
        if (includeDraft) {
            var qcOR = qc.addOrCondition("roster.rota.active", false);
            qcOR.addCondition("roster.rota.state", "draft");
        }
        memberGa.addEncodedQuery("from=NULL^ORfrom<=" + todayDate);
        memberGa.addEncodedQuery("to=NULL^ORto>=" + todayDate);
        memberGa.addQuery("roster.rota.group", groupId);
        memberGa.groupBy("member");
        memberGa.query();

        var memberIds = [];
        while (memberGa.next())
            memberIds.push(memberGa.member + "");
        if (!memberIds.length)
            return 0;

        var count = 0;
        var userMemberGa = new GlideAggregate(this.TABLES.SYS_USER_GRMEMBER);
        userMemberGa.addQuery("group", groupId);
        userMemberGa.addQuery("user", "IN", memberIds.join(","));
        userMemberGa.addQuery("group.active", "true");
        userMemberGa.addEncodedQuery("JOINsys_user_grmember.group=cmn_rota.group!groupISNOTEMPTY");
        userMemberGa.addAggregate('COUNT');
        userMemberGa.query();
        if (userMemberGa.next())
            count = userMemberGa.getAggregate('COUNT');
        return count;
    },

    escapeHTML: function(text) {
        return text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
    },

    getCurrentTimezone: function() {
        return this.escapeHTML(gs.getSession().getTimeZoneName() + "") + "";
    },

    getChoiceList: function(table, field) {
        var choiceListObj = GlideChoiceList.getChoiceList(table, field);
        choiceListObj.removeNone();
        var choiceListSize = choiceListObj.getSize();
        var choices = [];
        for (var i = 0; i < choiceListSize; i++) {
            var choice = choiceListObj.getChoice(i);
            choices.push({
                "name": this.escapeHTML(choice.getLabel() + ''),
                "value": choice.getValue() + ''
            });
        }
        return choices;
    },

    _sortTZ: function(timezones) {
        timezones = timezones.sort(function(tz1, tz2) {
            var tz1Name = tz1.name.toLowerCase();
            var tz2Name = tz2.name.toLowerCase();

            if (tz1Name < tz2Name)
                return -1;
            else if (tz1Name > tz2Name)
                return 1;
            else return 0;
        });
        return timezones;
    },

    getTimezoneList: function() {
        var timezones = this.getChoiceList(this.TABLES.USER, this.SYS_USER_FIELDS.TIMEZONE);
        var sessionTZ = this.escapeHTML(gs.getSession().getTimeZoneName() + "") + "";
        timezones = timezones.filter(function(timezone) {
            return timezone.value !== "NULL_OVERRIDE";
        });

        var isSessionTZAvailable = timezones.some(function(timezone) {
            return timezone.value === sessionTZ;
        });

        if (!isSessionTZAvailable) {
            timezones.push({
                name: sessionTZ,
                value: sessionTZ
            });
        }
        return this._sortTZ(timezones);
    },

    _getEscalationOfRotateMembers: function(rosterGr, rotaGr) {
        var numberOfReminders = rosterGr.attempts ? parseInt(rosterGr.attempts) : 0;
        var reminderDuration = rosterGr.time_between_reminders ? rosterGr.time_between_reminders.getGlideObject().getNumericValue() : 0;

        var memberGr = new GlideRecord(this.TABLES.CMN_ROTA_MEMBER);
        memberGr.addQuery("roster", rosterGr.getUniqueValue());
        memberGr.query();

        var rostersCount = rosterGr.getRowCount();
        rostersCount = !!rostersCount ? rostersCount : 0;
        var timeToStart = 0;
        var level = 1;
        var escalationSteps = [];
        while (memberGr.next()) {
            var step = {};
            step.name = {
                value: gs.getMessage("On Call Member {0}", level + ""),
                display_value: gs.getMessage("On Call Member {0}", level + "")
            };
            step.escalation_level = {
                value: level,
                display_value: level
            };
            step.delay_till_previous_step = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
            step.roster_sys_id = {
                value: rosterGr.getUniqueValue()
            };
            step.reminders = {
                label: gs.getMessage("Number of Reminders"),
                value: numberOfReminders
            };
            step.time_between_reminders = {
                value: reminderDuration,
                display_value: rosterGr.getDisplayValue('time_between_reminders')
            };
            step.detailed_reminders = [];
            var reminderNumber = 1;
            var perLevelOverallDuration = 0;
            while (reminderNumber <= numberOfReminders) {
                step.detailed_reminders.push({
                    value: reminderDuration,
                    display_value: gs.getMessage("Reminder {0} - {1}", [reminderNumber + "", new GlideDuration(reminderDuration).getDisplayValue()])
                });
                reminderNumber++;
                perLevelOverallDuration += reminderDuration;
            }
            var timeTakenDisplayValue = new GlideDuration(perLevelOverallDuration + reminderDuration).getDisplayValue();
            step.time_taken_at_step = {
                value: perLevelOverallDuration + reminderDuration,
                display_value: gs.getMessage("{0} delay", timeTakenDisplayValue)
            };
            step.time_to_next_step = {
                value: reminderDuration,
                display_value: new GlideDuration(reminderDuration).getDisplayValue()
            };
            timeToStart = timeToStart + perLevelOverallDuration + reminderDuration;
            level++;
            escalationSteps.push(step);
        }
        var totalTime;
        if (rotaGr && rotaGr.catch_all) {
            var catchAllStep = this._getCatchAllStep(rotaGr);
            catchAllStep.delay_till_previous_step = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
            escalationSteps.push(catchAllStep);
            totalTime = {
                value: timeToStart + catchAllStep.catch_all_wait_time,
                display_value: new GlideDuration(timeToStart + catchAllStep.catch_all_wait_time).getDisplayValue()
            };
        } else {
            totalTime = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
        }
        var escalation = {};
        escalation.steps = escalationSteps;
        escalation.total_time = totalTime;
        escalation.rosters_count = rostersCount;
        return escalation;
    },

    _getCatchAllWaitTime: function(rotaGr) {
        var catchAllWaitTime = 0;
        var catchAllDuration = rotaGr.catch_all_wait_time.getGlideObject();
        catchAllWaitTime = catchAllDuration ? catchAllDuration.getNumericValue() : 0;

        if (catchAllWaitTime == 0) {
            catchAllWaitTime = parseInt(gs.getProperty(this.CATCH_ALL_WAIT_TIME_PROPERTY, 0)) * 1000;
        }
        return catchAllWaitTime;
    },

    _getCatchAllStep: function(rotaGr) {
        var catchAllStep = {};
        catchAllStep.name = {
            value: 'catch_all',
            display_value: gs.getMessage("Catch-all")
        };
        catchAllStep.catch_all_type = {
            value: rotaGr.catch_all,
            display_value: rotaGr.getDisplayValue('catch_all')
        };
        switch (rotaGr.catch_all + '') {
            case 'all':
                catchAllStep.value = rotaGr.catch_all_roster;
                catchAllStep.display_value = rotaGr.getDisplayValue('catch_all_roster');
                break;
            case 'individual':
                catchAllStep.value = rotaGr.catch_all_member;
                catchAllStep.display_value = rotaGr.getDisplayValue('catch_all_member');
                break;
            case 'group_manager':
                catchAllStep.value = rotaGr.group.manager;
                catchAllStep.display_value = rotaGr.getDisplayValue('group.manager');
                break;
            default:
                catchAllStep.value = '';
                catchAllStep.display_value = '';
        }
        catchAllStep.catch_all_wait_time = this._getCatchAllWaitTime(rotaGr);
        return catchAllStep;
    },

    _getEscalationOfRotateRoster: function(rosterGr, rotaGr) {
        var timeToStart = 0;
        var level = 1;
        var escalationSteps = [];
        var rostersCount = rosterGr.getRowCount();
        rostersCount = !!rostersCount ? rostersCount : 0;
        while (rosterGr.next()) {
            var numberOfReminders = rosterGr.attempts ? parseInt(rosterGr.attempts) : 0;
            var reminderDuration = rosterGr.time_between_reminders ? rosterGr.time_between_reminders.getGlideObject().getNumericValue() : 0;

            var step = {};
            step.name = {
                value: rosterGr.name + "",
                display_value: rosterGr.name + ""
            };
            step.escalation_level = {
                value: level,
                display_value: level
            };
            step.delay_till_previous_step = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
            step.roster_sys_id = {
                value: rosterGr.getUniqueValue()
            };
            step.reminders = {
                label: gs.getMessage("Number of Reminders"),
                value: numberOfReminders
            };
            step.time_between_reminders = {
                value: reminderDuration,
                display_value: rosterGr.getDisplayValue('time_between_reminders')
            };
            step.detailed_reminders = [];
            var reminderNumber = 1;
            var perLevelOverallDuration = 0;
            while (reminderNumber <= numberOfReminders) {
                step.detailed_reminders.push({
                    value: reminderDuration,
                    display_value: gs.getMessage("Reminder {0} - {1}", [reminderNumber + "", new GlideDuration(reminderDuration).getDisplayValue()])
                });
                reminderNumber++;
                perLevelOverallDuration += reminderDuration;
            }
            var timeTakenDisplayValue = new GlideDuration(perLevelOverallDuration + reminderDuration).getDisplayValue();
            step.time_taken_at_step = {
                value: perLevelOverallDuration + reminderDuration,
                display_value: gs.getMessage("{0} delay", timeTakenDisplayValue)
            };
            step.time_to_next_step = {
                value: reminderDuration,
                display_value: new GlideDuration(reminderDuration).getDisplayValue()
            };
            timeToStart = timeToStart + perLevelOverallDuration + reminderDuration;
            level++;
            escalationSteps.push(step);
        }

        var totalTime;
        if (rotaGr && rotaGr.catch_all) {
            var catchAllStep = this._getCatchAllStep(rotaGr);
            catchAllStep.delay_till_previous_step = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
            escalationSteps.push(catchAllStep);

            totalTime = {
                value: timeToStart + catchAllStep.catch_all_wait_time,
                display_value: new GlideDuration(timeToStart + catchAllStep.catch_all_wait_time).getDisplayValue()
            };
        } else {
            totalTime = {
                value: timeToStart,
                display_value: new GlideDuration(timeToStart).getDisplayValue()
            };
        }
        var escalation = {};
        escalation.steps = escalationSteps;
        escalation.total_time = totalTime;
        escalation.rosters_count = rostersCount;
        return escalation;
    },

    getEscalationPathDefinition: function(rotaId, escalationSetId) {
        /**
         * @type {CmnRotaRosterGR}
         */

        var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
        if (!rotaGr.get(rotaId)) {
            return;
        }

        var isGroupEscalation = new OnCallRotation().isGroupEscalationApplied(rotaId);

        var rosterGr = new GlideRecord(this.TABLES.CMN_ROTA_ROSTER);
        rosterGr.addQuery("rota", rotaId);
        rosterGr.orderBy("order");
        rosterGr.addActiveQuery();
        rosterGr.query();
        if (isGroupEscalation || rotaGr.use_custom_escalation) {
            if (escalationSetId)
                return new OCEscalationDesigner().getEscalationSet(escalationSetId + "", rotaId);
            else
                return new OCEscalationDesigner().getDefaultEscalation(rotaId + "");
        } else if (rosterGr.getRowCount() == 1) {
            rosterGr.next();
            return this._getEscalationOfRotateMembers(rosterGr, rotaGr);
        } else {
            return this._getEscalationOfRotateRoster(rosterGr, rotaGr);
        }
    },

    /* Check whether to show the option to deactivate the schedule entry
     *  show for group and shift managers.
     */
    showDeactivateScheduleSpan: function(current) {
        if (current.group)
            return new OnCallSecurityNG().rotaMgrAccess(current.group);
        if (current.schedule.document == this.TABLES.CMN_ROTA) {
            var rotaGr = new GlideRecord(this.TABLES.CMN_ROTA);
            rotaGr.get(current.schedule.document_key);
            if (rotaGr)
                return new OnCallSecurityNG().rotaMgrAccess(rotaGr.group);
        }
        return false;
    },

    evaluateUiAction: function(table, current, actionName) {
        if (!table || !current || !actionName)
            return;

        var uiActionGr = new GlideRecord(this.TABLES.SYS_UI_ACTION);
        uiActionGr.addActiveQuery();
        uiActionGr.addQuery('table', table);
        uiActionGr.addQuery('action_name', actionName);
        uiActionGr.query();
        if (uiActionGr.next()) {
            var evaluator = new GlideScopedEvaluator();
            var result = evaluator.evaluateScript(uiActionGr, 'condition', {
                current: current
            });
            if (result != null) {
                if (result.toString() != "true")
                    return false;
            }
            return true;
        }
        return false;
    },

    /**
     * To get Spans (Primarily for Mobile use case)
     */
    getAllSpans: function(startDate, endDate, groupId, formatterType) {
        var formatter = null;
        var scriptInclude = OCFormatterMapping.formatters[formatterType];
        if (scriptInclude === OCDHTMLXCalendarFormatter)
            formatter = new scriptInclude(null, gs.getSession().getTimeZoneName() + "");
        else if (scriptInclude)
            formatter = new scriptInclude();

        var ocrRotaV2 = new OCRotationV2(null, formatter);
        return ocrRotaV2
            .setStartDate(startDate)
            .setEndDate(endDate, false)
            .setGroupIds(groupId)
            .getSpans();
    },

    /**
     * To Request Time Off (Primarily for Mobile use case)
     */
    requestTimeOff: function(startDate, endDate, allDayEvent, groupId, notes, proposedCover, memberSysId, formatterType) {
        if (!memberSysId)
            memberSysId = gs.getUserID();
        var maxDateRangeDaysDuration = parseInt(gs.getProperty("com.snc.on_call_rotation.calendar_span.max_time_off_days", "365"));
        var coverageDateDiff = gs.dateDiff(startDate, endDate, true);
        if (coverageDateDiff <= 0) {
            throw "Invalid time off spans";
        }
        var providedCoverageDurationInDays = parseInt(coverageDateDiff / (24 * 60 * 60));
        if (providedCoverageDurationInDays > maxDateRangeDaysDuration) {
            throw "Can not provide time off for more than " + maxDateRangeDaysDuration + " consecutive days.";
        }

        var formatter = null;
        var scriptInclude = OCFormatterMapping.formatters[formatterType];
        if (scriptInclude)
            formatter = new scriptInclude();
        return new OCAddItem(formatter)
            .setMemberSysId(memberSysId)
            .setGroupSysId(groupId)
            .setStartDateTime(startDate)
            .setEndDateTime(endDate)
            .setAllDay(allDayEvent)
            .setNotes(notes)
            .setProposedCover(proposedCover)
            .timeOff();
    },

    /**
     * To Provide coverage for mobile and web
     */
    addOverride: function(startSpanDate, endSpanDate, userId, rosterIds, groupId, format) {
        var scriptInclude = OCFormatterMapping.formatters[format];
        var spans = [];
        var formatter = null;
        if (scriptInclude)
            formatter = new scriptInclude();
        var rosterSysIds = [];
        if (rosterIds.indexOf(",") > -1)
            rosterSysIds = rosterIds.split(",");
        else
            rosterSysIds.push(rosterIds);

        var isCoverageRotaTimesOnlyEnabled = (gs.getProperty("com.snc.on_call_rotation.coverage.rota_times_only", "true") == "true");

        var maxDateRangeDaysDuration = parseInt(gs.getProperty("com.snc.on_call_rotation.calendar_span.max_date_range_days", "30"));
        var coverageDateDiff = gs.dateDiff(startSpanDate, endSpanDate, true);
        if (JSUtil.nil(coverageDateDiff)) {
            throw "Invalid coverage spans";
        }
        var providedCoverageDuration = parseInt(coverageDateDiff / (24 * 60 * 60));
        if (providedCoverageDuration > maxDateRangeDaysDuration) {
            throw "Can not provide coverage for more than " + maxDateRangeDaysDuration + " consecutive days.";
        }

        if (isCoverageRotaTimesOnlyEnabled) {
            var rotaRosterMap = {};
            var rosterNameMap = {};
            var rotaIds = [];
            var rosterGr = new GlideRecord('cmn_rota_roster');
            rosterGr.addQuery('sys_id', 'IN', rosterSysIds);
            rosterGr.query();
            while (rosterGr.next()) {
                if (!rotaRosterMap[rosterGr.getValue('rota')]) {
                    rotaRosterMap[rosterGr.getValue('rota')] = {};
                    rotaRosterMap[rosterGr.getValue('rota')].rosters = [rosterGr.getUniqueValue()];
                    rotaIds.push(rosterGr.getValue('rota'));
                } else {
                    rotaRosterMap[rosterGr.getValue('rota')].rosters.push(rosterGr.getUniqueValue());
                }
                rosterNameMap[rosterGr.getUniqueValue()] = rosterGr.getValue('name');
            }
            var ocRotationFormatter = new OCDHTMLXCalendarFormatter();
            var ocrRotaV2 = new OCRotationV2(null, ocRotationFormatter);

            var isSuccessAddedInSpan = false,
                isWarningAddedInSpan = false;
            var allSpansFromStartAndEndDate = ocrRotaV2
                .setStartDate(startSpanDate, true)
                .setEndDate(endSpanDate, null, true)
                .setRosterIds(rosterIds)
                .setGroupIds(groupId)
                .setRotaIds(rotaIds)
                .getSpans();


            var filteredRotaSpans = [];
            var filteredOverrideSpans = [];

            for (var i = 0; i < allSpansFromStartAndEndDate.length; i++) {
                if (allSpansFromStartAndEndDate[i].type == 'rota')
                    filteredRotaSpans.push(allSpansFromStartAndEndDate[i]);
                if (allSpansFromStartAndEndDate[i].type == 'override')
                    filteredOverrideSpans.push(allSpansFromStartAndEndDate[i]);
            }

            var createOverride = function(rosterId, startDate, endDate) {
                var successResult = new OCAddItem(formatter)
                    .setMemberSysId(userId)
                    .setRosterSysId(rosterId + "")
                    .setStartDateTime(startDate + "")
                    .setEndDateTime(endDate + "")
                    .createOverride();
                spans.push(successResult);
            };

            var conflictingOverrideSkipped = false;
            var errorMessagesData = {};

            for (var i = 0; i < filteredRotaSpans.length; i++) {
                var rotaSpan = filteredRotaSpans[i];
                var rotaId = rotaSpan.rota_id + '';
                var rosters = rotaRosterMap[rotaId].rosters.slice(0);

                var rotaStartDate = new GlideDateTime();
                rotaStartDate.setDisplayValueInternal(rotaSpan.start_date);
                var rotaEndDate = new GlideDateTime();
                rotaEndDate.setDisplayValueInternal(rotaSpan.end_date);

                for (var k = 0; k < rosters.length; k++) {

                    var rosterId = rosters[k] + '';

                    var rosterCompletelyOverlaps = false;
                    var rosterPartiallyOverlaps = false;

                    var previousOverrideEndDate = null;
                    var previousOverrideEndDateGDT = null;

                    filteredOverrideSpans.sort(
                        function(start, end) {
                            var currentDate = new GlideDateTime();
                            currentDate.setDisplayValueInternal(start.start_date);

                            var nextDate = new GlideDateTime();
                            nextDate.setDisplayValueInternal(end.start_date);

                            var res = currentDate.compareTo(nextDate);
                            return res;
                        });

                    //search for an conflicting override for that roster
                    for (var j = 0; j < filteredOverrideSpans.length; j++) {

                        var overrideSpan = filteredOverrideSpans[j];

                        if (rosterId == (overrideSpan.roster_id + '')) {
                            var overrideSpanStartDate = new GlideDateTime();
                            overrideSpanStartDate.setDisplayValueInternal(overrideSpan.start_date);

                            var overrideSpanEndDate = new GlideDateTime();
                            overrideSpanEndDate.setDisplayValueInternal(overrideSpan.end_date);

                            // if rota span in completely overlapped by existing override
                            if (rotaStartDate.compareTo(overrideSpanStartDate) >= 0 && rotaEndDate.compareTo(overrideSpanEndDate) <= 0) {
                                rosterCompletelyOverlaps = true;
                                break;
                            }

                            // if rota span is partially overlapping with existing override
                            else if ((rotaStartDate.compareTo(overrideSpanStartDate) <= 0 && rotaEndDate.compareTo(overrideSpanEndDate) >= 0) || (rotaStartDate.compareTo(overrideSpanStartDate) <= 0 && rotaStartDate.compareTo(overrideSpanEndDate) >= 0) || (rotaEndDate.compareTo(overrideSpanStartDate) <= 0 && rotaEndDate.compareTo(overrideSpanEndDate) >= 0)) {
                                rosterPartiallyOverlaps = true;

                                if (!previousOverrideEndDate && rotaStartDate.compareTo(overrideSpanStartDate) < 0)
                                    createOverride(rosterId, rotaSpan.start_date, overrideSpan.start_date);
                                else if (previousOverrideEndDate && previousOverrideEndDateGDT.compareTo(overrideSpanStartDate) < 0)
                                    createOverride(rosterId, previousOverrideEndDate, overrideSpan.start_date);

                                previousOverrideEndDate = overrideSpan.end_date;
                                previousOverrideEndDateGDT = overrideSpanEndDate;

                                if (!errorMessagesData[rosterId])
                                    errorMessagesData[rosterId] = [];
                                errorMessagesData[rosterId].push({
                                    start: overrideSpanStartDate.getDisplayValue(),
                                    end: overrideSpanEndDate.getDisplayValue()
                                });
                            }
                        }
                    }

                    if (previousOverrideEndDate && previousOverrideEndDateGDT.compareTo(rotaEndDate) < 0)
                        createOverride(rosterId, previousOverrideEndDate, rotaSpan.end_date);

                    if (rosterCompletelyOverlaps || rosterPartiallyOverlaps)
                        conflictingOverrideSkipped = true;

                    if (!rosterCompletelyOverlaps && !rosterPartiallyOverlaps && rotaStartDate.compareTo(rotaEndDate) < 0)
                        createOverride(rosterId, rotaSpan.start_date, rotaSpan.end_date);

                    if (rosterCompletelyOverlaps) {
                        if (!errorMessagesData[rosterId])
                            errorMessagesData[rosterId] = [];
                        errorMessagesData[rosterId].push({
                            start: rotaStartDate.getDisplayValue(),
                            end: rotaEndDate.getDisplayValue()
                        });
                    }

                }

            }

            if (conflictingOverrideSkipped) {
                var errorResult = {};
                errorResult.message = gs.getMessage("Some Coverages spans were not created since they already have a Coverage defined");
                errorResult.message_type = "warning";
                errorResult.no_hide = true;
                spans.push(errorResult);


                Object.keys(errorMessagesData).forEach(function(rosterId) {
                    var dateRanges = "";

                    errorMessagesData[rosterId].forEach(function(obj) {
                        if (GlideI18NStyle.getDirection() == 'ltr')
                            dateRanges = dateRanges + "(" + obj.start + " - " + obj.end + ") ";
                        else
                            dateRanges = " (" + obj.end + " - " + obj.start + ")" + dateRanges;
                    });

                    errorResult = {};
                    errorResult.message = gs.getMessage("Coverage creation skipped for {0} on date(s) {1} as there was a conflicting Coverage present.", [rosterNameMap[rosterId], dateRanges]);
                    errorResult.message_type = "warning";
                    errorResult.no_hide = true;
                    spans.push(errorResult);
                });

            }

        } else { // Legacy behaviour maintained for coverage creation

            for (var i = 0; i < rosterSysIds.length; i++)
                spans.push(new OCAddItem(formatter)
                    .setMemberSysId(userId)
                    .setRosterSysId(rosterSysIds[i])
                    .setStartDateTime(startSpanDate)
                    .setEndDateTime(endSpanDate)
                    .createOverride());
        }
        return spans;
    },

    /**
     * To Delete coverage (for Mobile and web)
     */
    deleteCoverage: function(tableName, sysId) {
        if (JSUtil.nil(tableName) || JSUtil.nil(sysId)) {
            return new sn_ws_err.BadRequestError("Invalid Table OR Sys_id provided");
        }

        var tableGr = new GlideRecord(tableName);
        if (tableGr.get(sysId)) {
            if (tableGr.canDelete()) {
                if (!tableGr.deleteRecord()) {
                    return new sn_ws_err.BadRequestError("Could not delete the record");
                }
            } else {
                var respError = new sn_ws_err.ServiceError();
                respError.setStatus(403);
                respError.setMessage("Security constraints prevent access to requested resource");
                return respError;
            }
        }
    },

    /**
     * To Replace coverage (for Mobile and web)
     */
    replaceCoverage: function(startSpanDate, endSpanDate, userId, rosterId, groupId, tableName, sysId, format) {
        var formatter = null;
        var scriptInclude = OCFormatterMapping.formatters[format];
        if (scriptInclude)
            formatter = new scriptInclude();

        var result = new OCAddItem(formatter)
            .setMemberSysId(userId)
            .setRosterSysId(rosterId)
            .setStartDateTime(startSpanDate)
            .setEndDateTime(endSpanDate)
            .createOverride(true);

        if (result.message_type !== "error") {
            if (JSUtil.nil(tableName) || JSUtil.nil(sysId)) {
                return new sn_ws_err.BadRequestError("Invalid Table OR Sys_id provided");
            }

            if (JSUtil.nil(userId)) {
                return new sn_ws_err.BadRequestError("Invalid User ID provided");
            }

            var tableGr = new GlideRecord(tableName);
            if (tableGr.get(sysId)) {
                if (!tableGr.canWrite()) {
                    var respError = new sn_ws_err.ServiceError();
                    respError.setStatus(403);
                    respError.setMessage("Security constraints prevent access to requested resource");
                    return respError;
                }
            } else {
                throw "Could not find any valid record with sys_id " + sysId;
            }

            result = new OCAddItem(formatter)
                .setMemberSysId(userId)
                .setRosterSysId(rosterId)
                .setStartDateTime(startSpanDate)
                .setEndDateTime(endSpanDate)
                .setIsReplaceCoverage(true)
                .setScheduleSpanId(sysId)
                .createOverride();
        }
        return result;
    },

    /**
     * to get the PTO Configuration for the given group
     */
    getPTOConfiguration: function(groupId) {
        return new OCRosterSpanApprovalUtil().isPTOApprovalRequired(groupId);
    },

    getManagedGroups: function() {
        var groupId;
        var myGroups = [];
        var isRotaAdmin = false;
        var ocsNG = new OnCallSecurityNG();

        var userSysId = gs.getUserID();

        if (gs.hasRole('rota_admin')) {
            isRotaAdmin = true;
        }

        var managerGroupGr = new GlideRecord("sys_user_group");
        this.addManagedGroupsQuery(managerGroupGr, userSysId, isRotaAdmin);
        managerGroupGr.query();

        while (managerGroupGr.next()) {
            myGroups.push(managerGroupGr.getUniqueValue());
        }

        if (!isRotaAdmin) {
            var gaHasRole = ocsNG.getDelegatedGroups(userSysId);

            while (gaHasRole.next()) {
                groupId = gaHasRole.getValue('granted_by');
                myGroups.push(groupId);
            }

            var groupIds = ocsNG.getManagedGroupsByPreferences(userSysId);

            groupIds.forEach(function(grId) {
                myGroups.push(grId);
            });
        }

        return myGroups;
    },

    getMyGroups: function() {
        var myGroups = [];
        var userSysId = gs.getUserID();

        var memberGroupGr = new GlideRecord("sys_user_grmember");
        memberGroupGr.addQuery('user', userSysId);
        memberGroupGr.addEncodedQuery("JOINsys_user_grmember.group=cmn_rota.group!active=true");
        memberGroupGr.query();

        while (memberGroupGr.next()) {
            myGroups.push(memberGroupGr.group + '');
        }

        return myGroups;
    },

    deleteTeamMember: function(groupMemberSysId) {
        var memberGr = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        if (memberGr.get(groupMemberSysId)) {
            return memberGr.canDelete() ? memberGr.deleteRecord() : false;
        }
    },

    getUserGroups: function() {
        if (this.getManagedGroups())
            return (this.getManagedGroups()).concat(this.getMyGroups());
        else
            return this.getMyGroups();
    },

    getOnCallDashboardURL: function() {

        if (GlidePluginManager.isActive("com.snc.pa.premium") && gs.hasRole("rota_prem_dashboard_user"))
            g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=292ad76653e700100c54ddeeff7b12a0");
        else
            g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=af9f6e7d53af00100c54ddeeff7b127f");
    },

    getOnCallGroups: function() {
        var uniqueValues = [];
        var ga = new GlideAggregate('cmn_rota');
        ga.addAggregate('COUNT');
        ga.groupBy('group');
        ga.addHaving('COUNT', '>', '0');
        ga.query();
        while (ga.next()) {
            if (ga.getValue('group'))
                uniqueValues.push(ga.getValue('group'));
        }
        return uniqueValues;
    },

    hasAccessToEscalationPolicy: function(escalationSetGr) {
        var group = escalationSetGr.cmn_rota.group;

        if (escalationSetGr.group_escalation + '')
            group = escalationSetGr.group_escalation.group;

        return new OnCallSecurityNG().rotaMgrAccess(group);
    },

    hasAccessToContactOverrides: function(contactPreferenceGr) {
        var group = contactPreferenceGr.cmn_rota.group;

        if (contactPreferenceGr.type == 'escalation_set' && contactPreferenceGr.escalation_set.group_escalation + '')
            group = contactPreferenceGr.escalation_set.group_escalation.group;

        return new OnCallSecurityNG().rotaMgrAccess(group);
    },

    getGroupEscalationMessage: function(type, rotaGr) {
        if (this.isOnCallStoreAppInstalled())
            return new sn_now_on_call.OnCallStoreAppUtil().getGroupEscalationMessage(type, rotaGr);

        if (type == 'rota_form')
            return gs.getMessage('Group escalation is applied.');

        if (type == 'escalation_designer')
            return gs.getMessage('Group escalation is applied. escalation designer is in read only mode.');

        if (type == 'creation_wizard')
            return gs.getMessage('Group escalation is applied.');

        return '';
    },

    // use user preferred language if exist, otherwise use default language
    getUserLang: function(userId) {
        var defaultLang = 'en';

        if (!userId)
            return defaultLang;

        var userGr = new GlideRecord(this.TABLES.USER);
        if (!userGr.get(userId))
            return defaultLang;

        var lang = userGr.preferred_language;
        if (lang)
            return lang.toString();

        return defaultLang;
    },

    getLanguageCodeForNotifyCall: function(userId) {
        var languageCode = this.getUserLang(userId);
        if (!languageCode) languageCode = this.DEFAULT_LANGUAGE_CODES['en'];
        var rowCount = 0;

        var notifyLanguageAgg = new GlideAggregate('notify_language');
        notifyLanguageAgg.addAggregate('COUNT');
        notifyLanguageAgg.addEncodedQuery("language_codeLIKE" + languageCode);
        notifyLanguageAgg.query();

        if (notifyLanguageAgg.next()) {
            rowCount = notifyLanguageAgg.getAggregate('COUNT');
        }

        if (rowCount == 1) {
            return languageCode;
        } else if (rowCount == 0) {
            return this.DEFAULT_LANGUAGE_CODES['en'];
        } else return this.DEFAULT_LANGUAGE_CODES[languageCode];
    },

    isOnCallStoreAppInstalled: function() {
        return GlidePluginManager.isActive('com.snc.on_call');
    },

    isNotifyPluginInstalled: function() {
        return GlidePluginManager.isActive('com.snc.notify');
    },

    isSlackPluginInstalled: function() {
        return GlidePluginManager.isActive('sn_slack_ah_v2');
    },

    isMobilePushInstalled: function() {
        // OnCall Mobile Notification shipped in scoped app in if/<store app mobile app> so must check both active
        return GlidePluginManager.isActive('com.sn_on_call_m_notif') && GlidePluginManager.isActive('com.sn_itsm_mobile_agent');
    },

    isTeamsPluginInstalled: function() {
        return GlidePluginManager.isActive('sn_now_teams');
    },

    isVAPluginInstalled: function() {
        return GlidePluginManager.isActive('com.glide.cs.chatbot.lite') && GlidePluginManager.isActive('com.sn.va.teams');
    },

    isVASetup: function() {
        var providerGr = new GlideRecord(this.TABLES.SYS_CS_PROVIDER_APPLICATION);
        providerGr.addQuery('message_auth.provider_name', OnCallCommonSNC.TEAMS_PROVIDER_NAME);
        providerGr.addNotNullQuery('message_auth');
        providerGr.setLimit(1);
        providerGr.query();
        return providerGr.hasNext();
    },

    isUsingNotifyCallForVoice: function(useNotifyCallForVoiceWFScratchpad) {
        var useNotifyCall = false;
        if (typeof useNotifyCallForVoiceWFScratchpad === 'undefined')
            useNotifyCall = gs.getProperty('com.snc.on_call_rotation.notification.voice.use_notify_call', false);
        else
            useNotifyCall = useNotifyCallForVoiceWFScratchpad;

        if (typeof useNotifyCall === 'string')
            useNotifyCall = (useNotifyCall === 'true');
        return useNotifyCall;
    },

    // Use this in case of boolean property
    getBooleanApplicationPropertyValue: function(prop) {
        var propertyValue = GlideApplicationProperty.getValue(prop);
        if (gs.nil(propertyValue)) {
            return true;
        }
        return propertyValue == 'true' || false;
    },

    shouldUseSlackForDM: function() {
        return this.isSlackPluginInstalled() && this.getBooleanApplicationPropertyValue("com.snc.on_call_rotation.use_slack_for_dm");
    },

    shouldUseTeamsForDM: function() {
        return this.isTeamsPluginInstalled() && this.getBooleanApplicationPropertyValue("com.snc.on_call_rotation.use_msteams_for_dm");
    },

    getDirection: function() {
        return GlideI18NStyle.getDirection();
    },

    isRecordAccessibleToUser: function(userSysId, recordGR) {
        if (!userSysId || !recordGR)
            return false;

        var canWrite = sn_fd.FlowAPI.executeSubflow("global.check_record_access_for_user", {
            user_id: userSysId,
            table_name: recordGR.getTableName(),
            operation: 'write',
            record_id: recordGR.getUniqueValue()
        }).output;

        return canWrite;
    },

    notifyDelegateUser: function() {
        return gs.getProperty(this.NOTIFY_DELEGATE_USER_PROPERTY) == "true";
    },

    checkIfDelegateExists: function(userSysId) {
        var gdt = new GlideDateTime();
        var delegateGr = new GlideRecord('sys_user_delegate');
        delegateGr.addQuery('user', userSysId);
        delegateGr.addQuery('notifications', 'true');
        delegateGr.addQuery("starts<=" + gdt);
        delegateGr.addQuery("ends>=" + gdt);
        delegateGr.setLimit(1);
        delegateGr.query();
        return delegateGr.hasNext();
    },

    getDelegateUserRecords: function(userSysId) {
        var gdt = new GlideDateTime();
        var delegateGr = new GlideRecord('sys_user_delegate');
        delegateGr.orderByDesc('sys_updated_on');
        delegateGr.addQuery('user', userSysId);
        delegateGr.addQuery('notifications', 'true');
        delegateGr.addQuery("starts<=" + gdt);
        delegateGr.addQuery("ends>=" + gdt);
        delegateGr.query();

        return delegateGr;

    },

    generateAPIKey: function(apiKeyName) {
        var glideTokenAuthContext = new sn_auth.GlideTokenAuthContext();
        glideTokenAuthContext.setAPIKeyName(apiKeyName);
        var glideTokenAuthClient = new sn_auth.GlideTokenAuthClient();
        var glideTokenAuthClientResponse = glideTokenAuthClient.createToken(glideTokenAuthContext);
        var token = glideTokenAuthClientResponse.getAPIToken();
        return token;
    },

    isValidUserAPIKey: function(userId, token) {
        if (gs.nil(userId) || !gs.tableExists('api_key') || gs.nil(token))
            return false;
        var apiKeyGr = new GlideRecord('api_key');
        apiKeyGr.addQuery('user', userId);
        apiKeyGr.addQuery('name', userId + " on-call subscription api key");
        apiKeyGr.setLimit(1);
        apiKeyGr.query();
        if (apiKeyGr.next())
            return apiKeyGr.token.getDecryptedValue() == token;
        return false;
    },

    getFormattedPhoneNumber: function(phoneNumber) {
        var phoneNumberElement = new GlideElementPhoneNumber();
        if (phoneNumberElement.setPhoneNumber(phoneNumber + "", true)) {
            return phoneNumberElement.getGlobalDisplayValue();
        }
    },

    /**
     * @param [Object] {'field': 'value'}
     * @param [string] schedule sysId to update record
     * @param [boolean] runWorkflow to setWorkflow false
     */
    updateScheduleRecord: function(scheduleObject, sysId, runWorkflow) {
        var scheduleObjectKeys = Object.keys(scheduleObject);
        if (gs.nil(sysId) || scheduleObjectKeys.length === 0)
            return;

        var scheduleGr = new GlideRecord(this.TABLES.CMN_SCHEDULE);
        if (scheduleGr.get(sysId)) {
            scheduleObjectKeys.forEach(function(key) {
                scheduleGr.setValue(key, scheduleObject[key]);
            });
            if (!runWorkflow) {
                scheduleGr.setWorkflow(false);
            }
            return scheduleGr.update();
        }
    },

    /**
     * @param [Object] dateTime
     * @param [string] timeZone
     */
    getDateTimeWithTimeZone: function(dateTime, timeZone) {
        dateTime.setTimeZone(timeZone);
        return dateTime.getDisplayValue();
    },

    getInfoMessages: function() {
        return gs.getInfoMessages();
    },

    getErrorMessages: function() {
        return gs.getErrorMessages();
    },

    flushMessages: function() {
        gs.flushMessages();
    },

    getSystemMessages: function() {
        var errorMessages = this.getErrorMessages();
        var result = {
            'infoMessages': [],
            'errorMessages': []
        };
        for (var i = 0; i < errorMessages.size(); i++) {
            result.errorMessages.push(errorMessages.get(i));
        }
        var infoMessages = this.getInfoMessages();
        for (i = 0; i < infoMessages.size(); i++) {
            result.infoMessages.push(infoMessages.get(i));
        }
        this.flushMessages();
        return result;
    },

    getDiffDays: function(startDateTime, endDateTime) {
        var startGdt = new GlideDate(startDateTime.split(" ")[0]);
        var endGdt = new GlideDate(endDateTime.split(" ")[0]);
        return GlideDate.subtract(startGdt, endGdt).getDayPart();
    },

    splitEvent: function(start, end, event, targetTimezone, conflict) {
        if (!start || !end) {
            return;
        }
        var startGdt = new GlideDateTime();
        startGdt.setTimeZone(targetTimezone);
        startGdt.setDisplayValueInternal(start);
        var endGdt = new GlideDateTime();
        endGdt.setTimeZone(targetTimezone);
        endGdt.setDisplayValueInternal(end);
        event.actualStart = startGdt.getDisplayValueInternal();
        event.actualEnd = endGdt.getDisplayValueInternal();
        if (conflict) {
            event.id = "conflict_" + conflict.rota_id + "_" + startGdt.getNumericValue();
        }
        var splittedEvents = [];
        var diffDays = this.getDiffDays(start, end);
        while (diffDays > -1) {
            var cloneEvent = JSON.parse(JSON.stringify(event));
            cloneEvent.startMS = startGdt.getNumericValue();
            cloneEvent.start = startGdt.getDisplayValueInternal();
            cloneEvent.startTime = cloneEvent.start.split(" ")[1];
            var days = this.getDiffDays(cloneEvent.start, end);
            if (days !== 0) {
                //different days
                var startDate = cloneEvent.start.split(' ')[0];
                var startDateTime = startDate + " 23:59:59";
                startGdt.setTimeZone(targetTimezone);
                startGdt.setDisplayValueInternal(startDateTime);
                cloneEvent.endMS = startGdt.getNumericValue();
                cloneEvent.end = startGdt.getDisplayValueInternal();
                startGdt.getTime().setTimeZone(targetTimezone);
                cloneEvent.endTime = cloneEvent.end.split(" ")[1];
                cloneEvent.id = (event.id) ? (event.id + '_' + diffDays) : (event.rosterId + "_" + cloneEvent.startMS + "_" + cloneEvent.endMS);
                splittedEvents.push(cloneEvent);
            } else {
                //same day
                cloneEvent.endMS = endGdt.getNumericValue();
                cloneEvent.end = endGdt.getDisplayValueInternal();
                endGdt.getTime().setTimeZone(targetTimezone);
                cloneEvent.endTime = cloneEvent.end.split(" ")[1];
                cloneEvent.id = (event.id) ? (event.id + '_' + diffDays) : (event.rosterId + "_" + cloneEvent.startMS + "_" + cloneEvent.endMS);
                splittedEvents.push(cloneEvent);
                break;
            }
            startGdt.setTimeZone(targetTimezone);
            startGdt.addSeconds(1);
            diffDays--;
        }
        return splittedEvents;
    },

    isSowRedirectionEnabledForOnCall: function() {
        return gs.getProperty(this.SOW_REDIRECTION_ON_CALL_PROPERTY, 'false') == 'true';
    },

    type: 'OnCallCommonSNC'
};
