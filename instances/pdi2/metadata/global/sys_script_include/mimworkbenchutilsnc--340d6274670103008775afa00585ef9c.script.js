var MIMWorkbenchUtilSNC = Class.create();

MIMWorkbenchUtilSNC.prototype = {

    ATTR_STATE: 'state',
    TABLE_SYS_CHOICE: 'sys_choice',
    TABLE_INCIDENT: 'incident',
    TABLE_INCIDENT_ALERT: 'incident_alert',
    ATTR_SOURCE: 'source',
    ATTR_INACTIVE: 'inactive',
    ATTR_LANGUAGE: 'language',
    ATTR_ELEMENT: 'element',
    ATTR_NAME: 'name',

    initialize: function() {},

    getUserProfile: function(userGr) {
        var liveProfile = new GlideappLiveProfile();
        return {
            avatar: liveProfile.getAvatar(liveProfile.getID(userGr.getUniqueValue() + "")) + "",
            initials: new SNC.LiveFeedApi().getInitials(userGr.name + "") + ""
        };
    },

    getEmailAddresses: function(incidentAlertSysId) {
        var emailAddress = [];
        var grContact = new GlideRecord("contact");
        grContact.addQuery("table", "incident_alert");
        grContact.addQuery("document", incidentAlertSysId);
        grContact.query();
        while (grContact.next()) {
            var type = grContact.type + "";
            var user = grContact.user.email + "";
            var group = grContact.group.email + "";

            if ("sys_user" == type && !JSUtil.nil(user))
                emailAddress.push(user);
            if ("sys_user_group" == type && !JSUtil.nil(group))
                emailAddress.push(group);
        }

        return emailAddress.join();
    },

    getNotesUrl: function(table, sysId) {
        return table + ".do?sys_id=" + sysId + "&sysparm_stack=no&sysparm_view=mim_act&sysparm_titleless=true&sysparm_link_less=true&sysparm_view_forced=true&sysparm_nofocus=true&sysparm_is_dialog_form=true";
    },
    canAccessWorkbench: function() {
        return gs.hasRole("itil,sn_incident_read");
    },
    canAddAffected: function(task) {
        return this.canCreate('task_ci') && this.isActive(task);
    },
    canAddImpacted: function(task) {
        return this.canCreate('task_cmdb_ci_service') && this.isActive(task);
    },
    canWrite: function(table) {
        return new GlideRecord(table).canWrite();
    },
    canCreate: function(table) {
        return new GlideRecord(table).canCreate();
    },
    canExportPIR: function(incidentGr) {
        if (!incidentGr)
            return false;
        var incidentStates = this.getAllIncidentStates();
        return incidentGr.major_incident_state == 'accepted' && (incidentGr.state == incidentStates.CLOSED || incidentGr.state == incidentStates.RESOLVED) && gs.hasRole('itil,sn_incident_write');
    },
    getExportPIRUIPage: function() {
        var uiPage = gs.getProperty('sn_major_inc_mgmt.pir_export_pdf_ui_page');
        return uiPage;
    },
    isActive: function(task) {
        return task.active + '' == 'true';
    },
    canChangeState: function() {
        return gs.hasRole('itil,sn_incident_write');
    },

    getIncidentStates: function(taskGr) {
        var states = this.getChoiceRecords('incident', 'state', taskGr, function(choice) {
            var state = {};
            state.label = choice.getLabel() + "";
            state.value = choice.getValue() + "";
            state.language = gs.getSession().getLanguage();
            return state;
        });

        // If state choices are not available for incident table, check for it's parent table using GlideChoiceList API
        if (states.length == 0) {
            var choiceListObj = GlideChoiceList.getChoiceList('incident', 'state');
            choiceListObj.removeNone();
            var choiceListSize = choiceListObj.getSize();
            for (var i = 0; i < choiceListSize; i++) {
                var choice = choiceListObj.getChoice(i);
                states.push({
                    label: choice.getLabel() + '',
                    value: choice.getValue() + '',
                    language: gs.getUser().getLanguage()
                });
            }
        }
        return states;
    },
    getTaskDetails: function(table, sys_id) {
        var requiredFields = ['number', 'sys_class_name', 'state', 'major_incident_state', 'sys_created_on', 'short_description', 'assigned_to', 'priority', 'category', 'description', 'close_code', 'close_notes', 'resolved_at', 'overview', 'lessons_learned', 'timeline', 'closed_at', 'active', 'problem_id', 'rfc', 'caused_by', 'cmdb_ci'];
        var gr = new GlideRecord(table);
        if (gr.get(sys_id)) {
            return {
                taskJs: this.toJS(gr, requiredFields),
                taskGr: gr
            };
        }
    },
    getIncidentFields: function(sys_id, requiredFields) {
        var gr = new GlideRecord(this.TABLE_INCIDENT);
        if (gr.get(sys_id))
            return this.toJS(gr, requiredFields);
    },
    toJS: function(gr, requiredFields, skipACL) {
        if (!gr)
            return;
        if (!gr.canRead())
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
                obj[elName].display_value = elem.getDisplayValue();
                obj[elName].value = elem.toString();
                obj[elName].label = elem.getLabel();

                if (gr[elName] != null && gr[elName].getGlideObject() && gr[elName]
                    .getGlideObject().getDisplayValueInternal()) {
                    obj[elName].display_value_internal = gr[elName].getGlideObject().getDisplayValueInternal();
                }
            }
        }
        return obj;
    },
    getTableFieldsMap: function(table) {
        var fieldsMap = {};
        var gr = new GlideRecord(table);
        gr.initialize();
        var fields = gr.getFields();
        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            var fieldName = field.getName() + "";
            fieldsMap[fieldName] = gr.getElement(fieldName).getLabel();
        }
        return fieldsMap;
    },

    evaluateUiAction: function(incidentGr, actionName) {
        if (!incidentGr || !actionName)
            return;

        var uiActionGr = new GlideRecord('sys_ui_action');
        uiActionGr.addActiveQuery();
        uiActionGr.addQuery('table', 'incident');
        uiActionGr.addQuery('action_name', actionName);
        uiActionGr.query();
        if (uiActionGr.next()) {
            var evaluator = new GlideScopedEvaluator();
            var result = evaluator.evaluateScript(uiActionGr, 'condition', {
                current: incidentGr
            });
            if (result != null) {
                if (result.toString() != "true")
                    return false;
            }
            return true;
        }
        return false;
    },
    getCloseCodes: function(taskGr) {
        return this.getChoiceRecords('incident', 'close_code', taskGr, function(choice) {
            var userLanguage = gs.getSession().getLanguage();
            return {
                "sys_id": {
                    "value": choice.getID() + ""
                },
                "label": {
                    "canRead": true,
                    "display_value": choice.getLabel() + "",
                    "value": choice.getLabel() + "",
                    "label": "Label"
                },
                "value": {
                    "canRead": true,
                    "display_value": choice.getValue() + "",
                    "value": choice.getValue() + "",
                    "label": "Value"
                },
                "language": {
                    "canRead": true,
                    "display_value": userLanguage,
                    "value": userLanguage,
                    "label": "Language"
                }
            };
        });
    },

    getChoiceRecords: function(table, element, taskGr, formatFunction) {
        var records = [];
        var existingDomain = gs.getSession().getCurrentDomainID();

        try {
            if (taskGr.getValue("sys_domain") != 'global')
                gs.getSession().setDomainID(taskGr.getValue("sys_domain"));

            var choiceListObj = new GlideChoiceListGenerator(table, element, taskGr.getValue(taskGr.getElement(element).getDependent())).get();

            var choiceListSize = choiceListObj.getSize();
            for (var i = 0; i < choiceListSize; i++) {
                var choice = choiceListObj.getChoice(i);

                if (choice.getValue().length() > 0) {
                    records.push(formatFunction(choice));
                }
            }
        } catch (e) {
            gs.error('Failed to fetch choices: ' + e);
        } finally {
            gs.getSession().setDomainID(existingDomain);
        }
        return records;
    },

    getAllIncidentStates: function() {
        return JSON.parse(new global.IncidentState().getIncidentState());
    },
    getCancelledIncidentStates: function() { // States for which time ticker on workbench stops ticking.
        var incidentStates = this.getAllIncidentStates();
        return [incidentStates.CANCELED, incidentStates.CLOSED, incidentStates.RESOLVED];
    },
    getResolvedIncidentStates: function() { // States for post incident report is displayed.
        var incidentStates = this.getAllIncidentStates();
        return [incidentStates.CLOSED, incidentStates.RESOLVED];
    },

    showGenerateTimeline: function(gr) {
        return gs.getUser().hasRole(sn_major_inc_mgmt.MajorIncidentTriggerRules.prototype.ROLE_MAJOR_INCIDENT_MANAGER) && gr.state == IncidentState.RESOLVED && gr.major_incident_state == sn_major_inc_mgmt.MajorIncidentTriggerRules.prototype.MAJOR_INCIDENT_STATE.ACCEPTED;
    },

    getRelatedIncidentTasks: function(sysId) {
        var incidentTasks = [];
        var incTasksGr = new GlideRecord("incident_task");
        incTasksGr.addQuery("incident", sysId);
        incTasksGr.query();
        while (incTasksGr.next() && incTasksGr.canRead()) {
            var jsonOb = this.toJS(incTasksGr, ['number', 'short_description', 'sys_class_name']);
            incidentTasks.push(jsonOb);
        }
        return incidentTasks;
    },

    canExportToPDF: function() {
        return GlidePluginManager.isActive('com.snc.whtp') && SNC.WHTPUtils.isEnabled();
    },

    isSlackPluginInstalled: function() {
        return GlidePluginManager.isActive('sn_slack_ah_v2');
    },

    isTeamsPluginInstalled: function() {
        return GlidePluginManager.isActive('sn_now_teams');
    },

    isOnCallPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.on_call_rotation');
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
        if (this.isOnCallPluginActive()) {
            return this.isSlackPluginInstalled() && this.getBooleanApplicationPropertyValue("com.snc.on_call_rotation.use_slack_for_dm");
        }
        return this.isSlackPluginInstalled();
    },

    shouldUseTeamsForDM: function() {
        if (this.isOnCallPluginActive()) {
            return this.isTeamsPluginInstalled() && this.getBooleanApplicationPropertyValue("com.snc.on_call_rotation.use_msteams_for_dm");
        }
        return this.isTeamsPluginInstalled();
    },

    type: 'MIMWorkbenchUtilSNC'
};

MIMWorkbenchUtilSNC.WORK_NOTES_AND_ACTIVITY = gs.getMessage("Work notes & Activity");
