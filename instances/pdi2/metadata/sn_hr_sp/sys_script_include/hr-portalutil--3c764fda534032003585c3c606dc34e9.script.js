var GLIDE_RECORD_ERROR_MESSAGE = 'Glide record cannot be empty';
var hrPluginActive = GlidePluginManager.isActive("com.sn_hr_core");
var replaceFieldTokens = function(value, record) {
    return hrPluginActive ? new sn_hr_core.VariableReplacer().replaceFieldTokens(value, record) : value;
};
var hr_PortalUtil = Class.create();
// Get the id for a parent case, given sys_id and table name from URL
hr_PortalUtil.getParentFromUrl = function(sysIdParam, tableParam) {
    var parent = sysIdParam;

    if (tableParam == 'sn_hr_core_task') {
        var task = new GlideRecord('sn_hr_core_task');
        if (task.get(parent))
            parent = String(task.parent);
    }
    return parent;
};

hr_PortalUtil.getParentJourney = function(sys_id, table) {
    if (GlidePluginManager.isActive("com.sn_jny") && table == 'sn_hr_le_case') {
        var jnyGr = new GlideRecord('sn_jny_journey');
        jnyGr.addQuery('le_case', sys_id);
        jnyGr.setLimit(1);
        jnyGr.query();
        if (jnyGr.next())
            return jnyGr.getUniqueValue();
    }
    return "";
};

hr_PortalUtil.getActualCaseRecord = function(hrCaseId) {
    var hrCase = new GlideRecord('sn_hr_core_case');
    if (hrCase.get(hrCaseId)) {
        if (hrCase.sys_class_name != 'sn_hr_core_case') {
            hrCase = new GlideRecord(hrCase.sys_class_name.toString());
            hrCase.get(hrCaseId);
        }
        return hrCase;
    }
    gs.warn('hr_PortalUtil.getActualCaseRecord: cannot get HR Case with sys_id ' + hrCaseId);
};
//Default tables
hr_PortalUtil._hrCaseTables = new GlideTableHierarchy('sn_hr_core_case').getAllExtensions();
hr_PortalUtil._hrTables = hr_PortalUtil._hrCaseTables.slice();
hr_PortalUtil._hrTables.push('sn_hr_core_task');

hr_PortalUtil._approvalTables = hr_PortalUtil._hrTables.slice();
hr_PortalUtil._approvalTables.push('sc_request');
hr_PortalUtil._itTables = new GlideTableHierarchy('sc_request').getAllExtensions();
hr_PortalUtil._smTables = new GlideTableHierarchy('sm_order').getAllExtensions();
hr_PortalUtil.isChatEnabled = function() {
    var result = GlidePluginManager.isActive('com.glide.connect.sp_widgets') &&
        gs.getProperty('glide.connect.chat.disabled', 'true') == 'false';

    result = result && hr_PortalUtil.askQuestionPropEnabled();

    return result;
};
hr_PortalUtil.askQuestionPropEnabled = function() {
    return gs.getProperty('sn_hr_sp.hr_ask_a_question_enabled', 'true') == 'true';
};
hr_PortalUtil.isPreChatQueue = function(chatQueueId) {
    var gr = new GlideRecord('sn_hr_sp_pre_chat');
    if (gr.isValid()) {
        gr.setLimit(1);
        gr.addQuery('queue', chatQueueId);
        gr.query();
        return gr.next();
    }
    return false;
};
hr_PortalUtil.prototype = {
    initialize: function(_gr) {
        this._gr = _gr;
        this._user = gs.getUserID();
        this._isAuthorizedSubjectPerson = _gr ? sn_hr_core.hr_Case.userHasSubjectPersonAccess(_gr) : false;
        this._isLEInstalled = GlidePluginManager.isActive('com.sn_hr_lifecycle_events');
        this._isSMInstalled = GlidePluginManager.isActive('com.snc.service_management.core');
        this.DELEGATION_PLUGIN_ACTIVE = GlidePluginManager.isActive('com.glide.granular_service_delegation');
        this._caseConfigForTicketPage = this._getCaseConfiguration(_gr);

        this._maxPersonFields = 6; // Maximum number of Person fields that can be configured
        this._maxDetailFields = 6; // Maximum number of Detail fields that can be configured

        this._awaitingAcceptanceState = 20; // Integer for awaiting acceptance state
        this._draftState = 1; // Integer for draft state

        this._defaultChildTodoLevels = 1; // Default number of levels to display the child todos
        this._maxChildTodoLevels = 3; // Maximum number of levels to display the child todos
        this.SKIPPED_TODO_TABLES = "sn_uni_task_universal_task"; //while fetching todos for a HR Case (to render on ticket page) these tables will be skipped
    },

    /**
     * Chat support is enabled if following plugin combinations are present
     * 1. com.glide.service-portal.agent-chat, com.glide.connect and com.glide.connect.support(deprecated)
     * 2. com.glide.service-portal.agent-chat and com.glide.awa
     * 3. com.glide.cs.chatbot
     */
    isChatSupportEnabled: function() {
        if (GlidePluginManager.isActive("com.glide.cs.chatbot"))
            return true;
        else if (GlidePluginManager.isActive("com.glide.service-portal.agent-chat")) {
            var isConnectEnabled = gs.getProperty('glide.connect.enabled', 'false') == 'true';
            var isConnectSupportEnabled = gs.getProperty('glide.connect.support.enabled', 'false') == 'true';
            if (isConnectEnabled && isConnectSupportEnabled)
                return true;
            else if (GlidePluginManager.isActive("com.glide.awa"))
                return true;
        }
        return false;
    },

    getHeaderOptions: function(widgetData) {
        if (gs.nil(widgetData) || gs.nil(widgetData.recordInfo))
            return {};

        var recordInfo = widgetData.recordInfo;

        if (recordInfo.sys_class_name == 'sc_request')
            return this.getHeaderOptionsRequests(widgetData);

        var headerOptions = {
            sys_id: String(recordInfo.sys_id)
        };
        if (!widgetData.onTicketPage)
            headerOptions.parentHeader = true;

        if (!gs.nil(widgetData.hasContent))
            headerOptions.hasContent = widgetData.hasContent;

        headerOptions.title = this._getHeaderTitle(recordInfo);

        if (widgetData.hasContent)
            headerOptions.panelToCollapse = widgetData.contentPanelId;

        headerOptions.headerLink = '?id=hrj_ticket_page&sys_id=' + recordInfo.sys_id;

        // For ESC portal, use M ticket page
        var ticketPageId = new sn_hr_sp.hr_TicketPageConfigUtil().getActiveTicketPageId();
        if (ticketPageId != null)
            headerOptions.headerLink = '?id=' + ticketPageId + '&sys_id=' + recordInfo.sys_id;

        if (widgetData.onTicketPage && this.canViewAssignmentFilter())
            headerOptions.showFilter = true;

        if (widgetData.isCompletedItem)
            headerOptions.completedItem = true;

        headerOptions.recordInfo = recordInfo;
        if (widgetData.isHeaderList && widgetData.hasTodo)
            headerOptions.showTodoPill = true;
        if (widgetData.isHeaderCaseList)
            headerOptions.isHeaderCaseList = true;
        return headerOptions;
    },

    /** Function to determine if a task/case needs to use global descriptions
     * @Param gr: GlideRecord of the case or a task.
     * @Return : Boolean.
     */
    _shouldGetGlobalDescriptions: function(gr) {
        if (gs.nil(gr)) throw new Error(this.GLIDE_RECORD_ERROR_MESSAGE);
        try {
            if (gr.template && gr.template.show_translated_fields)
                return true;
            return false;
        } catch (exception) {
            gs.error(exception.message);
            throw new Error(exception.message);
        }
    },

    /** Function to return short description for a case/task
     * @Param gr: GlideRecord of the case or a task.
     * @Return : String
     */
    getRecordShortDescription: function(gr) {
        var shortDesc;
        try {
            if (this._shouldGetGlobalDescriptions(gr))
                shortDesc = gr.getDisplayValue('template.short_description_for_employee');
			else if (gr.getRecordClassName() == "sn_lc_learning_task" && !gs.nil(gr.getDisplayValue('sn_hr_le_activity.hr_template.show_translated_fields')) && gr.sn_hr_le_activity.hr_template.show_translated_fields)
				shortDesc = gr.getDisplayValue('sn_hr_le_activity.hr_template.short_description_for_employee');
            else
                shortDesc = gr.getDisplayValue('short_description');

            if (!shortDesc)
                return '';
            return replaceFieldTokens(shortDesc, gr);
        } catch (exception) {
            gs.error(exception.message);
            throw new Error(exception.message);
        }
    },

    /** Function to return global description/rich description/description for a case/task
     * @Param gr: GlideRecord of the case or a task.
     * @Return : String
     */
    getRecordDescription: function(gr) {
        var desc;
        try {
            if (this._shouldGetGlobalDescriptions(gr))
                desc = gr.getDisplayValue('template.description_for_employee');
            else
                desc = (gr.getValue('rich_description') || gr.getValue('description'));

            if (!desc)
                return '';
            return replaceFieldTokens(desc, gr);
        } catch (exception) {
            gs.error(exception.message);
            throw new Error(exception.message);
        }
    },

    getHeaderOptionsRequests: function(widgetData) {
        var recordInfo = widgetData.recordInfo;
        var sysApprovalId = this.getSysApprovalId(recordInfo.sys_id);
        var headerOptions = {};

        headerOptions.recordInfo = widgetData.recordInfo;
        headerOptions.parentHeader = true;
        headerOptions.sys_id = String(recordInfo.sys_id);
        headerOptions.title = this.getRequestTitle(recordInfo);
        if (!sysApprovalId)
            headerOptions.headerLink = '?id=sc_request&table=sc_request&sys_id=' + recordInfo.sys_id;
        else
            headerOptions.headerLink = '?id=approval&table=sysapproval_approver&sys_id=' + sysApprovalId;

        if (widgetData && widgetData.hasContent)
            headerOptions.panelToCollapse = widgetData.contentPanelId;

        if (widgetData.isCompletedItem)
            headerOptions.completedItem = true;
        if (widgetData.isHeaderList && widgetData.hasTodo)
            headerOptions.showTodoPill = true;

        if (!gs.nil(widgetData.hasContent))
            headerOptions.hasContent = widgetData.hasContent;
        return headerOptions;
    },

    getSysApprovalId: function(caseId) {
        var approvalId = new GlideRecord('sysapproval_approver');
        approvalId.addQuery('sysapproval', caseId);
        approvalId.addQuery('approver', new sn_hr_core.hr_Utils().getApprovals(gs.getUserID()));
        approvalId.query();
        if (approvalId.next())
            return approvalId.getUniqueValue();

        return false;
    },

    getRequestTitle: function(recordInfo) {
        var requested_items = new GlideRecord('sc_req_item');
        requested_items.addQuery('request', recordInfo.sys_id);
        requested_items.addActiveQuery();
        requested_items.query();

        if (requested_items.getRowCount() > 1)
            return gs.getMessage('{0} requested items', requested_items.getRowCount());
        else if (requested_items.next() && requested_items.canRead())
            return requested_items.cat_item.getDisplayValue();
        else
            return recordInfo.number + '';
    },

    _getHeaderTitle: function(recordInfo) {
        if (String(hr_PortalUtil._hrCaseTables).indexOf(recordInfo.sys_class_name) >= 0 && recordInfo.type == "approval")
          return gs.getMessage('Approve Request');
        else if (String(hr_PortalUtil._hrCaseTables).indexOf(recordInfo.sys_class_name) >= 0)
		  return this._getCaseDescription(recordInfo.sys_id);
        else
          return replaceFieldTokens(recordInfo.short_description, recordInfo) || recordInfo.number;
    },

    getCaseTitle: function() {
        var title = this._getTitleFromCaseConfiguration(this._gr, this._caseConfigForTicketPage);
        if (!gs.nil(title))
            return title;
    },

    _getCaseTitle: function(gr) {
        var caseConfig;
        if (gr.sys_id != this._gr.sys_id)
            caseConfig = this._getCaseConfiguration(gr);
        else
            caseConfig = this._caseConfigForTicketPage;
        var title = this._getTitleFromCaseConfiguration(gr, caseConfig);
        if (!gs.nil(title))
            return title;
    },

    /*
    	Return the HR Case Configuration for the user based on conditions :
    	 - If User is Opened For or Approver.
    	 - If User is Subject Person or Task Assignee (or delegated).

    */
    _getCaseConfiguration: function(gr) {
        if (gs.nil(gr) || hr_PortalUtil._hrCaseTables.indexOf(gr.sys_class_name.toString()) == -1)
            return null;
        var userCaseConfig = new GlideRecord('sn_hr_core_config_case');
        var isOpenedForUser = !gs.nil(gr.getElement('opened_for')) ? gs.getUserID() == gr.getElement('opened_for') :
            false;
        if (isOpenedForUser || this.isApprovalRequired(String(gr.sys_id), gs.getUserID())) {
            if (!gs.nil(gr.hr_service) && !gs.nil(gr.hr_service.header_config_opened_for)) {
                userCaseConfig.get(String(gr.hr_service.header_config_opened_for));
                return userCaseConfig;
            }
        }

        var isSubjectPerson = !gs.nil(gr.getElement('subject_person')) ? gs.getUserID() == gr.getElement('subject_person') : false;
        if (isSubjectPerson || this._isTaskAssignee(String(gr.sys_id))) {
            if (!gs.nil(gr.hr_service) && !gs.nil(gr.hr_service.header_config_subject_person)) {
                userCaseConfig.get(String(gr.hr_service.header_config_subject_person));
                return userCaseConfig;
            }
        }
        if (!gs.nil(userCaseConfig) && !gs.nil(gr.parent) && !gs.nil(gr.hr_service.header_config_subject_person))
            userCaseConfig.get(String(gr.hr_service.header_config_subject_person));

        return userCaseConfig;
    },

    _isTaskAssignee: function(caseId) {
        if (this.DELEGATION_PLUGIN_ACTIVE)
            return this._getDelegatedTasks({
                tables: ['sn_hr_core_task'],
                encoded_query: 'parent=' + caseId
            }, gs.getUserID(), true).length > 0;

        var tasks = new GlideRecord('sn_hr_core_task');
        tasks.addQuery('parent', caseId);
        tasks.addQuery('assigned_to', gs.getUserID());
        tasks.setLimit(1);
        tasks.query();
        return tasks.hasNext();
    },

    _getTitleFromCaseConfiguration: function(caseGr, caseConfiguration) {
        if (!gs.nil(caseConfiguration)) {
            if (!gs.nil(caseConfiguration.getValue('custom_title')))
                return new sn_hr_core.hr_Utils().sanitize(String(caseConfiguration.custom_title));

            if (!gs.nil(caseConfiguration.title)) {
                var titles = String(caseConfiguration.title).split(',');
                var fieldTitleString = [];
                for (var i = 0; i < titles.length; i++) {
                    var ge = caseGr.getElement(titles[i] + '');
                    if (ge != null && ge.toString() != null && ge.canRead())
                        fieldTitleString.push(ge.getDisplayValue());
                }
                return String(fieldTitleString.join(' - '));
            }
        }
        return this._getCaseDescription(String(caseGr.sys_id));
    },

    _getCaseDescription: function(caseId) {
        var gr = new GlideRecord('sn_hr_core_case');
        var description;
        if (gr.get(caseId)) {
            var hr_service = gr.getDisplayValue('hr_service');
            var subject_person = gr.getDisplayValue('subject_person');
            var opened_for = gr.getDisplayValue('opened_for');
            if (!gs.nil(hr_service)) {
                description = hr_service;
                if (!gs.nil(subject_person))
                    description = description + ' - ' + subject_person;
                else if (!gs.nil(opened_for))
                    description = description + ' - ' + opened_for;
            }
        }
        return description;
    },

    /* Gets the description for to-dos of type HR case (used by ticket page)
    @param
    	caseId - sys id (String) of parent LE case
    	hrServiceSysId - sys id (String) of HR service associated with the child activity
    @return
    	description - String
    */
    getCaseDescriptionFutureTodo: function(caseId, hrServiceSysId) {
        var gr = new GlideRecord('sn_hr_core_case');
        var description;
        if (gr.get(caseId)) {
            var subject_person = gr.getDisplayValue('subject_person');
            var opened_for = gr.getDisplayValue('opened_for');
            var grService = new GlideRecord('sn_hr_core_service');
            if (grService.get(hrServiceSysId)) {
                description = grService.getDisplayValue();
                if (!gs.nil(subject_person))
                    description = description + ' - ' + subject_person;
                else if (!gs.nil(opened_for))
                    description = description + ' - ' + opened_for;
            }
        }
        return description;
    },

    getPeopleInfoFromCaseConfig: function() {
        var peoplesInfoJson = {
            peoplesInfo: []
        };

        if (!gs.nil(this._caseConfigForTicketPage)) {
            var config = this._caseConfigForTicketPage;
            for (var i = 1; i <= this._maxPersonFields; i++) {
                var personField = this._getFieldDetail(config.getValue('person_column_' + i),
                    config.getValue('person_' + i), config.getDisplayValue('p_custom_label_' + i));
                if (!this._isEmptyJsonObject(personField))
                    peoplesInfoJson.peoplesInfo.push(personField);
            }
        }
        return peoplesInfoJson;
    },

    _isEmptyJsonObject: function(obj) {
        return Object.keys(obj).length === 0;
    },

    getAdditionalFieldsInfo: function() {
        var additionalFieldsInfo = {
            additionalFields: []
        };

        if (!gs.nil(this._caseConfigForTicketPage)) {
            var config = this._caseConfigForTicketPage;

            for (var i = 1; i <= this._maxDetailFields; i++) {
                var additionalField = this._getFieldDetail(config.getValue('detail_column_' + i),
                    config.getValue('detail_' + i), config.getDisplayValue('d_custom_label_' + i));
                if (!this._isEmptyJsonObject(additionalField))
                    additionalFieldsInfo.additionalFields.push(additionalField);
            }
        }
        return additionalFieldsInfo;
    },

    processRecordsForSummary: function(tasks) {
        var processedToDos = [];
        var todoPageUtils = new sn_hr_sp.todoPageUtils();
        for (var i = 0; i < tasks.length; i++) {
            var task = tasks[i];
            var recordToShow = {};
            var tableName = task.recordInfo.sys_class_name;
            if (task.recordInfo) {
                recordToShow.future = false;
                recordToShow.sysId = task.recordInfo.uniqueId;
                recordToShow.tableName = tableName;
                recordToShow.closedAt = task.recordInfo.closed_at;
                recordToShow.isApprovalTable = (tableName == 'sysapproval_approver') ? true : false;
                recordToShow.todoNumber = task.recordInfo.number;
                recordToShow.state_num_value = task.recordInfo.state_num_value;
                recordToShow.state = task.recordInfo.state;
                recordToShow.url = '';
                recordToShow.taskType = task.recordInfo.type;
                recordToShow.todoConfigurationSysId = '';
                recordToShow.hasDueDate = task.recordInfo.due_date ? true : false;
                recordToShow.due_date = task.recordInfo.due_date;
                recordToShow.hasDueDateWarning = task.recordInfo.hasDueDateWarning;
                var dateInfo = tableName == 'sn_hr_core_task' ? this._getTodoDateInfo(task.recordInfo) : {
                    label: task.recordInfo.state,
                    numDays: ''
                };



                recordToShow.stateLabel = task.recordInfo.stateLabel;

                recordToShow.dueDateDisplayValue = dateInfo.label;
                recordToShow.dueDateDays = dateInfo.numDays;
                recordToShow.createdOn = task.recordInfo.sys_updated_on;
                recordToShow.isHRCase = task.recordInfo.isHRCase;
                recordToShow.onTicketPage = true;
                recordToShow.level = task.recordInfo.level;
                recordToShow.isCompleted = task.recordInfo.filter_info.pane_info.type == 'completed_todos';

                recordToShow.optionalLabel = task.recordInfo.optionalLabel;
                recordToShow.recordInfo = task.recordInfo;

                //Set the table name to sysapproval_approver for approver record
                if (task.recordInfo.type == 'approval')
                    recordToShow.tableName = 'sysapproval_approver';

                if (this._isLEInstalled && !data.future) {
                    var taskGr = new GlideRecord(tableName);
                    taskGr.get(task.recordInfo.sys_id);
                    var activitySetInfo = this._getActivitySetRecordInfo(taskGr, task.recordInfo.parent);
                    if (activitySetInfo && activitySetInfo.is_adhoc)
                        task.recordInfo.future = activitySetInfo.state === 'awaiting_trigger';
                }

                //set widgetmappings display value list and due dates for all the records which respects the to-do
                // config
                if (task.recordInfo.metTodoConfig) {
                    recordToShow.isHRCase = false;
                    recordToShow.widgetMappings = task.recordInfo.toDoSummaryWidgetMappings;
                    recordToShow.displayValueList = task.recordInfo.toDoSummarydisplayValueList;
                    recordToShow.dueDateDisplayValue = task.recordInfo.toDoSummarydueDateDisplayValue;
                } else if (task.recordInfo.future) {
                    recordToShow.future = true;
                    recordToShow.dueDateDisplayValue = gs.getMessage('Upcoming to-do');
                    recordToShow.assigned_to_id = task.recordInfo.assigned_to_id;
                    recordToShow.displayValueList = [this._getTodoDescription(task.recordInfo), ''];
                    recordToShow.widgetMappings = [{
                        'condition': '',
                        'widgetSysId': '',
                        'widgetId': 'hro-future-todo'
                    }];
                } else {
                    recordToShow.displayValueList = [this._getTodoDescription(task.recordInfo), ''];
                    var widgetId = '';
                    if (task.recordInfo.type == 'task' && task.recordInfo.isHRCase)
                        widgetId = 'hrm-case-summary';
                    else
                        widgetId = 'hrm-task-activity';
                    recordToShow.widgetMappings = [{
                        'condition': '',
                        'widgetSysId': '',
                        'widgetId': widgetId
                    }];
                }

            }
            processedToDos.push(recordToShow);
        }
        return processedToDos;
    },

    _getTodoDescription: function(recordInfo) {
        var hrTables = new GlideTableHierarchy(recordInfo.sys_class_name).getTables();

        if (hrTables.indexOf('sn_hr_core_case') > -1) {
            var grCase = new GlideRecord(recordInfo.sys_class_name);
            var caseExists = grCase.get(recordInfo.sys_id);

            if (caseExists) {
                var util = new hr_PortalUtil(grCase);
                return util.getCaseTitle();
            }
        }

        return this._getTodoTitle(recordInfo);
    },

    _getTodoTitle: function(recordInfo) {
        if (recordInfo.sys_class_name == 'sc_request')
            return this.getRequestTitle(recordInfo);
        return this._getHeaderTitle(recordInfo);
    },
    getUsersForPortalDisplay: function(term, field_name) {
        var userList = {
            uList: []
        };

        var hrCase = new GlideRecord('sn_hr_core_case');
        hrCase.setLimit(1);
        hrCase.query();

        var users = new GlideRecord('sys_user');
        if (term.charAt(0) == '*') {
            term = term.substr(1);
            users.addQuery('name', 'CONTAINS', term);
        } else
            users.addQuery('name', 'STARTSWITH', term);
        users.addActiveQuery();
        if (field_name && hrCase.next() && hrCase.getElement(field_name).getED().getReferenceQualifier())
            users.addEncodedQuery(hrCase.getElement(field_name).getED().getReferenceQualifier());
        users.orderBy(users.getDisplayName());
        users.query();
        while (users.next()) {
            var u = {};
            u.text = users.name.getDisplayValue();
            u.id = users.getUniqueValue();
            u.department = users.department.getDisplayValue();
            userList.uList.push(u);
        }
        return userList;
    },

    _getTodoDateInfo: function(recordInfo) {
        var days = '';
        var message = '';
        var isApproval = recordInfo.type == 'approval';
        var notComplete = isApproval ? recordInfo.state_value == 'requested' : recordInfo.active;
        var taskUtil = new sn_hr_core.hr_Task();
        var todoPageUtils = new sn_hr_sp.todoPageUtils();
        if (recordInfo.future) {
            message = gs.getMessage('Upcoming to-do');
            return {
                label: message,
                numDays: 0
            };
        }

        if (notComplete)
            days = taskUtil.getDueDays(recordInfo.due_date);
        else if (isApproval)
            days = taskUtil.getDueDays(recordInfo.sys_updated_on);
        else
            days = taskUtil.getDueDays(recordInfo.closed_at);

        if (notComplete)
            message = todoPageUtils.getTaskDueDateDisplayValue(recordInfo.due_date);
        else
            message = recordInfo.stateLabel;
        return {
            label: message,
            numDays: days
        };
    },

    _getFieldDetail: function(isFieldSelected, fieldMapping, fieldLabel) {
        var field = {};
        var config = this._caseConfigForTicketPage;
        var hrCase = this._gr;
        var translatedFields = ['hr_service.template.short_description_for_employee',
            'template.short_description_for_employee', 'template.description_for_employee',
            'hr_service.template.description_for_employee'
        ];
        var htmlFields = ['html', 'translated_html', 'html_template', 'html_script'];
        if (isFieldSelected == '1' && !gs.nil(fieldMapping)) {
            if (fieldMapping == 'rich_description' && gs.nil(hrCase.getElement(fieldMapping).toString()))
                fieldMapping = 'description';

            var ge = hrCase.getElement(fieldMapping);
            if (ge != null && ge.toString() != null && (ge.canRead() || translatedFields.indexOf(fieldMapping) >= 0)) {
                field.label = !gs.nil(fieldLabel) ? this.sanitize(String(fieldLabel)) : ge.getLabel();
                field.type = ge.getED().getInternalType();
                field.fieldDisplayValue = ge.getDisplayValue();
                field.fieldValue = ge.toString();
                field.isHTML = htmlFields.indexOf(field.type) >= 0;
                var user = new GlideRecord('sys_user');
                field.isUserField = user.get('sys_id', ge.toString());
                field.isWritable = ge.canWrite();
                field.fieldMapping = fieldMapping;
                if (field.type == 'glide_list') {
                    field.listDetails = [];
                    if (field.fieldValue) {
                        var userArray = String(field.fieldValue).split(',');
                        for (var i = 0; i < userArray.length; i++) {
                            var list_user = new GlideRecord('sys_user');
                            var userInfo = {};
                            if (list_user.get(userArray[i])) {
                                userInfo.id = String(list_user.sys_id);
                                userInfo.name = String(list_user.name);
                                userInfo.department = list_user.department.getDisplayValue();
                            }
                            field.listDetails.push(userInfo);
                        }
                    }
                }
            }
        }
        return field;
    },

    /*
     * Return Reference qualifier for Hr Case Header configuration that would be valid for
     * the particular HR Service.
     *
     * @param hrService - which has reference to 'sn_hr_core_config_case' record.
     * @return - encoded query containing list of COE String that matches COE from passed HR Service with  existing HR Case Configuration Records.
     */
    getCaseHeaderConfigurations: function(hrService) {
        var coeArray = [];
        var queryString = 'coeIN';
        var caseHeaderConfig = new GlideRecord('sn_hr_core_config_case');
        caseHeaderConfig.addActiveQuery();
        caseHeaderConfig.addQuery('coe', 'IN',
            new GlideTableHierarchy(hrService.topic_detail.topic_category.coe).getTables());
        caseHeaderConfig.query();
        while (caseHeaderConfig.next())
            coeArray.push(String(caseHeaderConfig.coe));
        return queryString + String(coeArray);
    },

    /**
     * Check whether or not the given HR Case has any lifecycle events associated with it.
     * Will return false if the lifecycle plugin is not installed.
     */
    hasLifecycleEvents: function() {
        if (this._isLEInstalled && this._gr &&
            hr_PortalUtil._hrCaseTables.indexOf(this._gr.sys_class_name.toString()) >= 0) {
            var grContext = new GlideRecord('sn_hr_le_activity_set_context');
            grContext.addQuery('hr_case', this._gr.getUniqueValue());
            grContext.setLimit(1);
            grContext.query();

            return grContext.hasNext();
        }
        return false;
    },

    getFilterPanels: function(onTicketPage) {
        var overdue, dueSoon, completed, all, future;
        var panels = [];

        overdue = {
            label: gs.getMessage('Overdue'),
            panelName: 'overdue',
            indicatorClass: 'overdue',
            count: 0
        };
        dueSoon = {
            label: gs.getMessage('Due Soon'),
            panelName: 'due_soon',
            indicatorClass: 'due-today',
            count: 0
        };
        completed = {
            label: gs.getMessage('Completed'),
            panelName: 'completed_todos',
            indicatorClass: 'complete',
            count: 0
        };
        future = {
            label: gs.getMessage('Future'),
            panelName: 'future_todos',
            indicatorClass: 'future',
            count: 0
        };
        all = {
            label: gs.getMessage('All'),
            panelName: 'all_todos',
            count: 0
        };
        panels.push(overdue);
        panels.push(dueSoon);
        panels.push(completed);
        panels.push(future);
        if (onTicketPage)
            panels.push(all);

        return panels;
    },

    isOpenedForView: function() {
        return this._isOpenedForView(this._gr);
    },
    isSubjectPersonView: function() {
        return this._isSubjectPersonView(this._gr);
    },

    allowDisplayActivitySet: function() {
        return this._allowDisplayActivitySet(this._gr);
    },

    allowDisplayActivitySetToSubjectPerson: function() {
        return this._allowDisplayActivitySetToSubjectPerson(this._gr);
    },

    /**
     * The assignmentfilter will be viewable for Opened for or Subject Persons viewing a case with the property checked
     * Will return false for other users (task assignee, approvers, etc)
     */
    canViewAssignmentFilter: function() {
        return this._gr && (this._isAuthorizedSubjectPerson || this.isOpenedForView());
    },

    getApprovalCount: function(caseId) {
        var grApproval = new GlideRecordSecure('sysapproval_approver');
        grApproval.addQuery('sysapproval', caseId);
        grApproval.query();
        return grApproval.getRowCount();
    },

    isApprovalRequired: function(caseId, userId) {
        // Check for granular delegations
        var config = {
            'encoded_query': 'sysapproval=' + caseId + '^ORdocument_id=' + caseId,
            'limit': 1
        };
        if (new sn_hr_core.hr_Delegation().getDelegatedApprovals(config, userId, true).length > 0)
            return true;

        var grApprovalRequire = new GlideRecordSecure('sysapproval_approver');
        grApprovalRequire.addQuery('sysapproval', caseId);
        grApprovalRequire.addQuery('approver', new sn_hr_core.hr_Utils().getApprovals(userId));
        grApprovalRequire.setLimit(1);
        grApprovalRequire.query();
        return grApprovalRequire.hasNext();
    },

    ticketPage: function() {
        var page = this.isLegacyPortal() ? 'hri_task_details' : 'hrj_ticket_page';

        // For ESC portal, use M ticket page
        if (page == 'hrj_ticket_page') {
            var ticketPageId = new sn_hr_sp.hr_TicketPageConfigUtil().getActiveTicketPageId();
            if (ticketPageId != null)
                page = ticketPageId;
        }

        return page;
    },

    // return true if Istanbul (legacy) portal is still in use
    isLegacyPortal: function() {
        var portal = new GlideRecord('sp_portal');
        return portal.get('31e232209f22120047a2d126c42e70b4') && portal.url_suffix == 'hrportal';
    },

    hasAttachments: function(tableSysId) {
        var gr = new GlideRecord('sys_attachment');
        return gr.get('table_sys_id', tableSysId);
    },

    /* Start of Refactoring */

    getActivitySetContexts: function(caseId) {
        var contextValues = [];
        var hiddenContextValues = [];
        var firstRunningActvitySet = {};
        var lastFinishedActivitySet = {};

        var grContext = new GlideRecord('sn_hr_le_activity_set_context');
        grContext.addQuery('hr_case', caseId);
        grContext.orderBy('activity_set.display_order');
        grContext.query();

        while (grContext.next()) {
            var activeProgress = this._isActivitySetActive(grContext.state) ? true : false;
            if (contextValues.length > 0) {
                if (activeProgress && this._isActivitySetActive(contextValues[contextValues.length - 1].state))
                    contextValues[contextValues.length - 1].activeProgress = true;
                else
                    contextValues[contextValues.length - 1].activeProgress = false;
            }

            var activitySet = {};
            activitySet.id = grContext.getUniqueValue();
            activitySet.name = grContext.activity_set.display_title.toString();
            activitySet.state = grContext.state.toString();
            activitySet.stateDisplay = grContext.state.getDisplayValue();
            activitySet.order = Number(grContext.activity_set.display_order);

            // check if the current activity set needs to be skipped (hidden)
            if (this._hideActivitySet(grContext)) {
                hiddenContextValues.push(activitySet);
                continue;
            }

            if (this._isEmptyJsonObject(firstRunningActvitySet) && grContext.state == 'running_activities') {
                firstRunningActvitySet.id = activitySet.id;
                firstRunningActvitySet.name = activitySet.name;
                firstRunningActvitySet.state = activitySet.state;
            }
            if (grContext.state == 'finished') {
                lastFinishedActivitySet.id = activitySet.id;
                lastFinishedActivitySet.name = activitySet.name;
                lastFinishedActivitySet.state = activitySet.state;
            }
            contextValues.push(activitySet);
        }

        //select the 1st running activity set by defalult
        if (!this._isEmptyJsonObject(firstRunningActvitySet))
            return {
                viewAllToDos: false,
                firstOpen: firstRunningActvitySet.id,
                firstOpenName: firstRunningActvitySet.name,
                firstOpenState: firstRunningActvitySet.state,
                contexts: contextValues,
                hiddenContexts: hiddenContextValues
            };

        //select the lastest finished Activity Set when it is not the last activity set and there is no any running
        // activity set
        if (!this._isEmptyJsonObject(lastFinishedActivitySet) && lastFinishedActivitySet.id !=
            contextValues[contextValues.length - 1].id)
            return {
                viewAllToDos: false,
                firstOpen: lastFinishedActivitySet.id,
                firstOpenName: lastFinishedActivitySet.name,
                firstOpenState: lastFinishedActivitySet.state,
                contexts: contextValues,
                hiddenContexts: hiddenContextValues
            };

        //view all to-dos is checked by default if all activity sets are finished. Last activity set is used for toggle
        // -  when uncheck view all to-dos,  the last activity set is selected
        return {
            viewAllToDos: true,
            firstOpen: contextValues.length > 0 ? contextValues[contextValues.length - 1].id : '',
            firstOpenName: contextValues.length > 0 ? contextValues[contextValues.length - 1].name : '',
            firstOpenState: contextValues.length > 0 ? contextValues[contextValues.length - 1].state : '',
            contexts: contextValues,
            hiddenContexts: hiddenContextValues
        };
    },

    getBadgeForRecord: function(gr, isAcceptanceOrApproval) {
        var isHRTask = !isAcceptanceOrApproval && gr.sys_class_name == 'sn_hr_core_task';
        var isCase = this._isCase(String(gr.sys_class_name));
        var activityGr = null;
        var USER_BADGE_PREFIX = 'user_';

        var badgeInfo = {};

        if (!isHRTask && this._isLEInstalled)
            if (gr.sn_hr_le_activity) {
                activityGr = this._getActivityOrEmployeeRequestGr(gr.getValue(sn_hr_core.hr.TABLE_ACTIVITY));
            } else {
                var activityStatusRecord = new GlideRecord('sn_hr_le_activity_status');
                if (activityStatusRecord.get('generated_record', gr.getUniqueValue()))
                    activityGr = this._getActivityOrEmployeeRequestGr(activityStatusRecord.getValue(sn_hr_core.hr.ACTIVITY));
            }

        if (isAcceptanceOrApproval) {
            badgeInfo.filter = USER_BADGE_PREFIX + gs.getUserID();
            badgeInfo.display_name = gs.getUserDisplayName();
        } else if (isHRTask && !gs.nil(gr.assigned_to)) {
            badgeInfo.filter = USER_BADGE_PREFIX + gr.assigned_to;
            badgeInfo.display_name = gr.getDisplayValue('assigned_to');
        } else if (gr.sys_class_name == 'sn_lc_learning_task') {
            badgeInfo.filter = USER_BADGE_PREFIX + gr.assigned_to;
            badgeInfo.display_name = gr.getDisplayValue('assigned_to');
        } else if (!gs.nil(activityGr))
            badgeInfo = this._setBadgeValues(activityGr, badgeInfo);
        else if (isCase)
            badgeInfo = this._setBadgeValues(gr.hr_service, badgeInfo);
        else if (gr.getTableName().equals('sn_doc_task')) {
            badgeInfo.filter = USER_BADGE_PREFIX + gr.assigned_to;
            badgeInfo.display_name = gr.getDisplayValue('assigned_to');
        }

        return badgeInfo;
    },

    /** Private Methods **/
    /**
     * Method to return the activity glide record  or employee request glide record
     * depending on the sys_class_name. if the sys_class name does not exist
     * or the sys_id does not exist in base null is returned.
     * @param {string} activityBaseId: sys id of the activity base
     * @return {GlideRecord}: Glide record of activity or employee request or null.
     */
    _getActivityOrEmployeeRequestGr: function(activityBaseId) {
        try {
            var activityBaseGr = new GlideRecord("sn_hr_le_activity_base");
            if (!activityBaseGr.get(activityBaseId))
                return null;
            var sysClassName = activityBaseGr.getValue("sys_class_name");
            if (sysClassName == "sn_hr_le_activity")
                return this._getLEActivityGr(activityBaseId);
            else if (sysClassName == "sn_hr_le_employee_request")
                return this._getEmployeeREquestGR(activityBaseId);
            return null;
        } catch (error) {
            gs.error(error + '');
            throw new Error(error + '');
        }

    },

    /**
     * Method to return the activity glide record, or null if the record does not exist
     * @param {string} activityId: sys id of the activity
     * @return {GlideRecord}: Glide record of activity or null.
     */
    _getLEActivityGr: function(activityId) {
        try {
            var activityGr = new GlideRecord("sn_hr_le_activity");
            return activityGr.get(activityId) ? activityGr : null;
        } catch (error) {
            gs.error(error + '');
            throw new Error(error + '');
        }
    },

    /**
     * Method to return the employee request glide record, or null if the record does not exist
     * @param {string} employeeRequestId: sys id of the employee request
     * @return {GlideRecord}: Glide record of employee request or null.
     */
    _getEmployeeREquestGR: function(employeeRequestId) {
        try {
            var employeeRequestGr = new GlideRecord("sn_hr_le_employee_request");
            return employeeRequestGr.get(employeeRequestId) ? employeeRequestGr : null;
        } catch (error) {
            gs.error(error + '');
            throw new Error(error + '');
        }

    },

    _setBadgeValues: function(hrService, result) {
        var badgeDisplayValue = '';
        var badgeDescription = '';
        var CASE_BADGE_PREFIX = 'case_badge_';
        result.filter = '';
        result.display_name = '';
        result.description = '';

        if (gs.nil(hrService.badge)) {
            return result;
        }

        badgeDisplayValue = String(hrService.badge.name).toUpperCase();
        badgeDescription = String(hrService.badge.badge_description);
        if (badgeDisplayValue) {
            result.filter = CASE_BADGE_PREFIX + badgeDisplayValue;
            result.display_name = badgeDisplayValue;
            result.description = badgeDescription;
        }

        return result;
    },

    _getOwnerGroupInitials: function(ownerGroupGr) {
        var groupName = ownerGroupGr.getDisplayValue().toUpperCase();
        if (groupName.length >= 4)
            groupName = groupName.substring(0, 3);
        return groupName;
    },

    getTaskInfo: function() {
        var taskInfo = [];
        taskInfo.push(this._getRelevantInfoForRecord(this._gr, false));
        return taskInfo;
    },

    getChildTodoInfo: function(mineOnly) {
        var levelsToDisplay = this.canViewAssignmentFilter() ? this._maxChildTodoLevels : this._defaultChildTodoLevels;
        var tasksInfo = [];

        this._anyTodosForMe = false;

        //Add Acceptance for the parent case. Suppress Awaiting acceptance todo when associated to universal request.
        var hasAcceptanceTodo = hr_PortalUtil._hrCaseTables.indexOf(this._gr.getRecordClassName()) >= 0 &&
            this._gr.state == this._awaitingAcceptanceState && this._gr.opened_for == this._user &&
            this._gr.universal_request == '';
        if (hasAcceptanceTodo) {
            tasksInfo.push(this._getRelevantInfoForRecord(this._gr, true));
            this._anyTodosForMe = true;
        }

        //Add Task and Approval To-dos for each level
        for (var level = 1; level <= levelsToDisplay; level++) {
            var taskTables = this._getLineItemTaskTables(level);
            for (var i = 0; i < taskTables.length; i++) {
                this._addChildrenTasksForLevel(taskTables[i], level, tasksInfo, mineOnly);
            }
            this._addChildrenApprovalsForLevel(level, tasksInfo);
        }

        return tasksInfo;

    },

    _addChildrenTasksForLevel: function(className, level, todoList, mineOnly) {
        var parentId = String(this._gr.sys_id);
        var grTask = new GlideRecord(className);

        //Restrict To-dos to Acceptance HR Cases and self-assigned HR Tasks if mineOnly is true (such as on dashboard)
        if (mineOnly) {
            if (className == 'sn_hr_core_case') {
                grTask.addQuery('opened_for', this._user);
                grTask.addQuery('state', this._awaitingAcceptanceState);
            }
            if (className == 'sn_hr_core_task') {
                var qc = grTask.addQuery('assigned_to', this._user);
                qc.addOrCondition('sys_id', 'IN', this._getDelegatedTasks({
                    tables: [className],
                    encoded_query: this._getParentQueryStringForLevel(level) + '=' + parentId
                }));
            }
        }
        grTask.addQuery(this._getParentQueryStringForLevel(level), parentId);
        //Suppress Awaiting acceptance todo when associated to universal request.
        if (this._gr.universal_request != '')
            grTask.addQuery('state', '!=', this._awaitingAcceptanceState);
        //Filter out draft HR Cases/Tasks
        if (hr_PortalUtil._hrTables.indexOf(className) >= 0)
            grTask.addQuery('state', '!=', this._draftState);

        grTask.query();

        while (grTask.next()) {
            if (grTask.canRead()) {
                var hasAcceptanceTodo = hr_PortalUtil._hrCaseTables.indexOf(className) >= 0 && grTask.state ==
                    this._awaitingAcceptanceState && grTask.opened_for == this._user &&
                    (grTask.parent.parent.parent.parent != parentId) && this._gr.universal_request == '';
                todoList.push(this._getRelevantInfoForRecord(grTask));

                if (hasAcceptanceTodo) {
                    todoList.push(this._getRelevantInfoForRecord(grTask, true));
                    this._anyTodosForMe = true;
                }
            }
        }
    },

    /* Get the delegated assignments for a user
    	@param config - Object - Object describing delegation records to retrieve
    		{
    			@param tables - Array - (optional) - The tables to get delegated records from
    			@param start_date - String - (optional) - Get delegate records at or after this date
    			@param encoded_query - String - (optional) - The condition to filter delegated records
    			@param limit - Number - (optional) - The maximum number of records to get
    		}
    	@param userId - String - (optional) - The user to get delegated records for
    	@param includeUsersRecords - boolean (optional) - Include the users assigned records as well as delegated records
    	@return Array - An array of delegated record sys_id's
    */
    _getDelegatedTasks: function(config, userId, includeUserRecords) {
        var delegatedRecords = [];

        if (!this.DELEGATION_PLUGIN_ACTIVE)
            return delegatedRecords;

        if (!userId)
            userId = gs.getUserID();

        var grTasks = new sn_delegation.DelegationUtil().getDelegatedAssignmentsForUser(userId, !!includeUserRecords, config);
        while (grTasks.next())
            delegatedRecords.push(grTasks.getUniqueValue());

        return delegatedRecords;
    },

    _addChildrenApprovalsForLevel: function(level, todoList) {
        var parentId = String(this._gr.sys_id);
        var grApproval = new GlideRecord('sysapproval_approver');

        //Approval To-dos only appear for the logged-in user
        grApproval.addQuery('approver', new sn_hr_core.hr_Utils().getApprovals(this._user));
        grApproval.addQuery(this._getParentQueryStringForLevel(level, true), parentId);
        grApproval.addQuery('sysapproval.sys_class_name', 'IN', hr_PortalUtil._approvalTables);
        grApproval.addQuery('state', '!=', 'not requested');

        //Add parent query based on level

        grApproval.query();

        while (grApproval.next()) {
            if (grApproval.canRead()) {
                todoList.push(this._getRelevantInfoForRecord(grApproval));
                this._anyTodosForMe = true;
            }
        }
    },

    _getRelevantInfoForRecord: function(gr, isAcceptance) {
        var className = gr.getRecordClassName();
        var isApproval = className == 'sysapproval_approver';
        var recordInfo = {};
        var todoPageUtils = new sn_hr_sp.todoPageUtils();
        if (this._gr)
            recordInfo['rootParent'] = this._gr.sys_id.toString();

        if (isApproval) {
            //Approval display fields
            recordInfo['state'] = gr.getDisplayValue('state');
            recordInfo['state_num_value'] = gr.getValue('state');
            recordInfo['number'] = gr.sysapproval.number.toString();
            recordInfo['sys_updated_on'] = gr.sys_updated_on.toString();
            recordInfo['grandParent'] = gr.sysapproval.parent.toString();
            recordInfo['parent'] = gr.sysapproval.toString();
            recordInfo['parentDisplayName'] = gr.sysapproval.number.toString();
            //Approval logical fields
            recordInfo['state_value'] = gr.state.toString();
            recordInfo['sysapproval'] = gr.sysapproval.toString();
            recordInfo['sysapproval_parent'] = gr.sysapproval.parent.toString();
            recordInfo['sys_class_name'] = gr.sysapproval.sys_class_name.toString();
            recordInfo['sys_id'] = gr.getUniqueValue();
            recordInfo['type'] = 'approval';
            recordInfo['title'] = this._getHeaderTitle(recordInfo);
            recordInfo['isHRCase'] = false;
        } else if (className == 'sn_doc_task') {
            recordInfo['assigned_to'] = gr.getDisplayValue('assigned_to');
            recordInfo['assigned_to_id'] = gr.assigned_to.toString();
            recordInfo['number'] = gr.number.toString();
            recordInfo['short_description'] = replaceFieldTokens(gr.short_description.toString(), gr);
            recordInfo['state'] = gr.getDisplayValue('state');
            recordInfo['state_num_value'] = gr.getValue('state');
            recordInfo['due_date'] = gr.due_date.toString();

            //Task logical fields
            recordInfo['active'] = gr.active == true;
            recordInfo['closed_at'] = gr.closed_at.toString();
            recordInfo['parent'] = isAcceptance ? gr.getUniqueValue() : gr.parent.toString();
            recordInfo['parentDisplayName'] = gr.getDisplayValue('parent');
            recordInfo['sys_class_name'] = className;
            recordInfo['sys_updated_on'] = gr.sys_updated_on.toString();
            recordInfo['sys_id'] = gr.getUniqueValue();
            recordInfo['type'] = isAcceptance ? 'acceptance' : 'task';
            recordInfo['isHRCase'] = this._isCase(className);
            recordInfo['chatWidgetParams'] = this.getChatWidgetParams(gr);
        } else {
            //Task display fields
            recordInfo['assigned_to'] = gr.getDisplayValue('assigned_to');
            recordInfo['assigned_to_id'] = gr.assigned_to.toString();
            recordInfo['number'] = gr.number.toString();
            recordInfo['short_description'] = this.getRecordShortDescription(gr);
            recordInfo['state'] = gr.getDisplayValue('state');
            recordInfo['state_num_value'] = gr.getValue('state');
            //Task logical fields
            recordInfo['active'] = gr.active == true;
            recordInfo['closed_at'] = gr.closed_at.toString();
            recordInfo['due_date'] = gr.due_date.toString();
            recordInfo['grandParent'] = isAcceptance ? gr.parent.toString() : gr.parent.parent.toString();
            recordInfo['parent'] = isAcceptance ? gr.getUniqueValue() : gr.parent.toString();
            recordInfo['parentDisplayName'] = gr.getDisplayValue('parent');
            recordInfo['sys_class_name'] = className;
            recordInfo['sys_updated_on'] = gr.sys_updated_on.toString();
            recordInfo['sys_id'] = gr.getUniqueValue();
            recordInfo['type'] = isAcceptance ? 'acceptance' : 'task';
            recordInfo['isHRCase'] = this._isCase(className);
            recordInfo['chatWidgetParams'] = this.getChatWidgetParams(gr);
            recordInfo['hasDueDateWarning'] = todoPageUtils._getDueDateWarning(gr.due_date);
            recordInfo['optionalLabel'] = todoPageUtils._getOptionalLabel(gr);

            //HR Case specific fields
            if (hr_PortalUtil._hrCaseTables.indexOf(className) >= 0) {
                recordInfo['hr_service'] = gr.hr_service.getDisplayValue();
                recordInfo['opened_for'] = gr.opened_for.getDisplayValue();
                recordInfo['opened_for_id'] = gr.opened_for.toString();
                recordInfo['subject_person'] = gr.subject_person.getDisplayValue();
                recordInfo['showAllLevels'] = gr.opened_for == this._user ||
                    (gr.subject_person == this._user && gr.hr_service.subject_person_access);
                recordInfo['title'] = this._getCaseTitle(gr);

            } else
                recordInfo['title'] = this._getTodoTitle(recordInfo);


            if (className == 'sn_hr_core_task' && this._isAssignedOrDelegated(gr, this._user))
                this._anyTodosForMe = true;

        }

        recordInfo['stateLabel'] = todoPageUtils.getStateLabel(gr);

        //Add information needed for client filtering
        recordInfo['filter_info'] = {
            'badge_info': this.getBadgeForRecord(gr, isAcceptance || isApproval),
            'pane_info': this._lineItemType(gr, isAcceptance)
        };
        if (this._isLEInstalled) {
            var activitySetInfo = this._getActivitySetRecordInfo(gr);
            recordInfo['filter_info']['activity_set_info'] = activitySetInfo;
            recordInfo.future = activitySetInfo && activitySetInfo.is_adhoc && activitySetInfo.state === 'awaiting_trigger';
        }

        return recordInfo;
    },

    /* Determine if user is assigned or delegated to a record
    	@param record - GlideRecord - The record to check if user is assigned or delegated to
    	@param userId - String - (optional) - The user to check if record is assigned or delegated to
    	@return Boolean - Whether or not the record is assigned or delegated to @param user
    */
    _isAssignedOrDelegated: function(record, userId) {
        if (!record || !record.isValid())
            return false;

        if (!userId)
            userId = gs.getUserID();

        if (record.getElement('assigned_to').toString() == userId)
            return true;

        if (this.DELEGATION_PLUGIN_ACTIVE && new sn_delegation.DelegationUtil().isRecordDelegatedToUser(userId, record))
            return true;

        return false;
    },

    // construct Activity Set information
    _constructActivitySetInfo: function(gr) {
        if (gr)
            return {
                'activity_set_context': gr.activity_set_context.sys_id + '',
                'activity_set_sys_id': gr.activity_set_context.activity_set.sys_id + '',
                'state': gr.activity_set_context.state.toString(),
                'state_display': gr.activity_set_context.state.getDisplayValue(),
                'hide_activity_set': this._hideActivitySet(gr.activity_set_context),
                'activity_display_order': this._getDisplayOrder(gr),
                'is_adhoc': !gr.activity
            };
        else
            return {
                'activity_set_context': '',
                'activity_set_sys_id': '',
                'state': '',
                'state_display': '',
                'hide_activity_set': '',
                'activity_display_order': '',
                'is_adhoc': false
            };
    },

    /**
     * @param {GlideRecord} gr - an activity status record
     * @returns {string} - the display order for the related record either
     *    from the related sn_hr_le_activity or the related task record
     */
    _getDisplayOrder: function(gr) {
        var activityDisplayOrder = gr.getElement('activity.display_order');
        if (activityDisplayOrder)
            return activityDisplayOrder.toString();

        var relatedRecord = new GlideRecord(gr.table.toString());
        if (!relatedRecord.get(gr.related_record.toString()))
            return '';

        if (!relatedRecord.isValidField('display_order'))
            return '';

        var displayOrder = relatedRecord.getValue('display_order');
        if (!displayOrder)
            return '';

        return displayOrder.toString();
    },

    _getActivitySetRecordInfo: function(taskRec, leCaseId) {
        if (!leCaseId)
            leCaseId = this._gr ? this._gr.getUniqueValue() : leCaseId;

        if (gs.nil(taskRec.sys_id) || !leCaseId)
            return '';
        //Current Record
        var gr = new GlideRecord(sn_hr_core.hr.TABLE_ACTIVITY_STATUS);
        gr.addQuery('activity_set_context.hr_case', leCaseId);
        gr.addQuery('related_record', taskRec.sys_id).addOrCondition('generated_record', taskRec.sys_id);
        gr.query();

        if (gr.next())
            return this._constructActivitySetInfo(gr);

        //Set activity set of the parent as this record's activity set
        if (gs.nil(taskRec.parent))
            return '';

        gr = new GlideRecord(sn_hr_core.hr.TABLE_ACTIVITY_STATUS);
        gr.addQuery('activity_set_context.hr_case', leCaseId);
        gr.addQuery('related_record', taskRec.parent.sys_id).addOrCondition('generated_record', taskRec.parent.sys_id);
        gr.query();

        if (gr.next())
            return this._constructActivitySetInfo(gr);

        //Set activity set of the grand parent as this record's activity set
        if (gs.nil(taskRec.parent.parent))
            return '';

        gr = new GlideRecord(sn_hr_core.hr.TABLE_ACTIVITY_STATUS);
        gr.addQuery('activity_set_context.hr_case', leCaseId);
        gr.addQuery('related_record', taskRec.parent.parent.sys_id)
            .addOrCondition('generated_record', taskRec.parent.parent.sys_id);
        gr.query();

        if (gr.next())
            return this._constructActivitySetInfo(gr);

        return '';
    },

    _getLineItemTaskTables: function(level) {
        var parentId = String(this._gr.sys_id);
        var taskTables = [];

        var aggregate = new GlideAggregate('task');
        aggregate.addQuery(this._getParentQueryStringForLevel(level), parentId);
        //Skipping Universal tasks on ticket page. These tasks will be rendered on todos page (hrm_todos_page)
        aggregate.addQuery('sys_class_name', 'NOT IN', this.SKIPPED_TODO_TABLES);
        aggregate.groupBy('sys_class_name');
        aggregate.query();

        while (aggregate.next()) {
            taskTables.push(String(aggregate.sys_class_name));
        }

        return taskTables;
    },

    _getParentQueryStringForLevel: function(level, isApproval) {
        var parentString = isApproval ? 'sysapproval' : 'parent';
        for (var i = 1; i < level; i++)
            parentString = parentString + '.parent';

        return parentString;
    },

    _lineItemType: function(gr, isAcceptanceItem) {
        var isApprovalItem = !isAcceptanceItem && gr.getTableName() == 'sysapproval_approver';
        var completedApproval = isApprovalItem && gr.getValue('state') != 'requested';
        var completedTask = !isApprovalItem && !gr.active;

        var object = {
            id: gr.getUniqueValue(),
            isAcceptance: isAcceptanceItem,
            isApproval: isApprovalItem,
            isOptional: gr.getValue("optional") == 1
        };

        if (completedApproval || completedTask) {
            object.type = 'completed_todos';
            object.timestamp = new GlideDateTime(completedTask ? gr.closed_at : gr.sys_updated_on).getNumericValue();
        } else if (isAcceptanceItem) {
            object.type = 'overdue';
            object.timestamp = new GlideDateTime().getNumericValue();
        } else if (!gs.nil(gr.due_date)) {
            object.type = (new sn_hr_core.hr_Task().getDueDays(gr.due_date + '') < 0) ? 'overdue' : 'due_soon';
            object.timestamp = new GlideDateTime(gr.due_date).getNumericValue();
        } else {
            object.type = 'due_later';
            object.timestamp = new GlideDateTime(gr.sys_created_on).getNumericValue();
        }

        return object;
    },

    _getChatSetupHrFulfillerValue: function() {
        var hrFulfiller;

        if (!this.isSpAgentChatInstalled()) {
            hrFulfiller = 'connect';
        } else {
            var chatSetup = new GlideRecord('sys_cs_live_agent_setup');
            chatSetup.addQuery('name', 'Chat Setup');
            chatSetup.query();
            while (chatSetup.next())
                hrFulfiller = chatSetup.getValue('hr_fulfiller');
        }

        return hrFulfiller;
    },

    _isAWAInstalled: function() {
        return GlidePluginManager.isActive('com.glide.awa');
    },
    _isConnectSupportInstalled: function() {
        return GlidePluginManager.isActive('com.glide.connect.support');
    },
    isConnectSPWidgetsInstalled: function() {
        return GlidePluginManager.isActive('com.glide.connect.sp_widgets');
    },
    isConnectInstalled: function() {
        return GlidePluginManager.isActive('com.glide.connect');
    },
    isSpAgentChatInstalled: function() {
        return GlidePluginManager.isActive('com.glide.service-portal.agent-chat');
    },

    /* check the configuration whether connect widget needs to be loaded or not */
    getConnectChatConfiguration: function(taskGr) {
        if (taskGr.sys_class_name == sn_hr_core.hr.TABLE_TASK) {

            var chatType = taskGr.task_support_team;
            if (chatType == 'users_and_groups' && this.isConnectInstalled() && hr_PortalUtil.isChatEnabled())
                return true;
            else {
                var hrFulfiller = this._getChatSetupHrFulfillerValue();

                if (chatType == 'queue' && this._isAWAInstalled() && hrFulfiller == 'service_workspace')
                    return null;
                else if (chatType == 'queue' && this._isConnectSupportInstalled() && hr_PortalUtil.isChatEnabled() && hrFulfiller == 'connect')
                    return true;
                else if (chatType == 'agent_workspace' && this._isAWAInstalled() && this.isSpAgentChatInstalled() && hrFulfiller == 'service_workspace')
                    return false;
                else if (chatType == 'agent_workspace' && this._isConnectSupportInstalled() && hrFulfiller == 'connect')
                    return null;
            }
        } else {
            var hrFulfiller = this._getChatSetupHrFulfillerValue();

            if (this._isAWAInstalled() && this.isSpAgentChatInstalled() && hrFulfiller == 'service_workspace')
                return false;
            else if (this._isConnectSupportInstalled() && hr_PortalUtil.isChatEnabled() && hrFulfiller == 'connect')
                return true;
        }
        return null;
    },

    isAskAQuestionVisible: function(taskGr) {
        if (taskGr.sys_class_name == sn_hr_core.hr.TABLE_TASK) {
            var chatType = taskGr.task_support_team;
            if (chatType == 'users_and_groups' && this.isConnectInstalled() && hr_PortalUtil.isChatEnabled())
                return true;
            else if (chatType == 'queue' && this._isConnectSupportInstalled() && hr_PortalUtil.isChatEnabled())
                return true;
            else if (chatType == 'agent_workspace' && this._isAWAInstalled() && this.isSpAgentChatInstalled() && hr_PortalUtil.askQuestionPropEnabled())
                return true;
        } else {
            var hrFulfiller = this._getChatSetupHrFulfillerValue();
            if (this._isAWAInstalled() && this.isSpAgentChatInstalled() && hrFulfiller == 'service_workspace' && hr_PortalUtil.askQuestionPropEnabled())
                return true;
            else if (this._isConnectSupportInstalled() && hr_PortalUtil.isChatEnabled() && hrFulfiller == 'connect' && hr_PortalUtil.askQuestionPropEnabled())
                return true;
        }
        return false;
    },

    /* Check whether any chat is not in ClosedComplete/ClosedAbandoned state in interaction record for current user */
    checkForActiveChat: function() {
        var gr = new GlideRecord('interaction');
        gr.addQuery('opened_for', this._user);
        gr.addEncodedQuery('stateNOT INclosed_complete,closed_abandoned');
        gr.query();
        return gr.hasNext();
    },

    /* Returns the Live agent topic name from VA General Settings */
    getLiveAgentTopicName: function() {
        if (GlidePluginManager.isActive('com.glide.cs.chatbot')) {
            var generalSettingsGr = new GlideRecord('sys_cs_general_settings');
            if (generalSettingsGr.get('sys_domain', 'global'))
                return generalSettingsGr.getDisplayValue('live_agent_topic');
        }

        return null;
    },
    /* Returns an object with NASS enablement status and the search text */
    getSearchContext: function($sp) {
        var isNASSEnabled = (typeof $sp.isNowAssistEnabled === 'function' && $sp.isNowAssistEnabled()) ||
            (typeof $sp.isDynamicChatAssistantEnabled === 'function' && $sp.isDynamicChatAssistantEnabled());
        var search_text;
        if (isNASSEnabled || (typeof $sp.isChatAssistantEnabled === 'function' && $sp.isChatAssistantEnabled())) {
            search_text = GlidePluginManager.isActive('com.sn_hr_gen_ai') ?
                "'Ask HR question'" :
                this.getLiveAgentTopicName();
        } else if (GlidePluginManager.isActive('com.sn_hr_virtual_agent')) {
            search_text = 'Ask a Question (Template)';
        } else {
            search_text = this.getLiveAgentTopicName();
        }
        return {
            isNASSEnabled: isNASSEnabled,
            search_text: search_text
        };
    },
    /* To get the AWA queue id configured for particular task. */
    getTaskAWAQueue: function() {
        if (this._gr.sys_class_name == sn_hr_core.hr.TABLE_TASK && this._gr.awa_queue)
            return this._gr.awa_queue.number.toString();
        else
            return '';
    },

    _getCaseGlideRecord: function(case_sys_id) {
        var caseGr = new GlideRecord('sn_hr_core_case');
        if (caseGr.get(case_sys_id))
            return caseGr;

        return null;
    },

    getHrCaseCoe: function(case_sys_id) {
        var caseGr = this._getCaseGlideRecord(case_sys_id);
        if (caseGr != null)
            return caseGr.hr_service.service_table.toString();

        return null;
    },

    getHrCaseTableName: function(case_sys_id) {
        var caseGr = this._getCaseGlideRecord(case_sys_id);
        if (caseGr != null)
            return caseGr.sys_class_name.toString();

        return null;
    },

    /* Setup the widget params for chat widget */
    getChatWidgetParams: function(gr) {

        if (!gr)
            gr = this._gr;

        if (!gr)
            return;

        if (!this.isAskAQuestionVisible(gr))
            return '';


        var groupUsers, parent;
        var options = {
            'allow_attachments': true,
            'show_card_details': true,
            'show_system_messages': false,
            'record_table': gr.getValue('sys_class_name'),
            'record_id': gr.getUniqueValue(),
            'welcome': gs.getMessage('Hello, how can I help you?')
        };
        if (gr.sys_class_name == sn_hr_core.hr.TABLE_TASK) { // HR task recipients are determined by the configuration on the task
            var hr_Task = new sn_hr_core.hr_Task(gr);
            options.title = gs.getMessage('Ask a question about this task');
            var recipients;
            var chatType = gr.task_support_team;
            if (chatType == 'queue' && !gs.nil(gr.queue)) {
                options.type = 'queue';
                options.queue = gr.getValue('queue');
                options.owner_table = sn_hr_core.hr.TABLE_TASK;
                options.owner_id = gr.getUniqueValue();
            } else if (chatType == 'users_and_groups' &&
                (!gs.nil(gr.getValue('parent_case_users')) || !gs.nil(gr.getValue('groups')))) {
                options.type = 'record';
                if (!gs.nil(gr.getValue('parent_case_users'))) {
                    var fields = gr.getValue('parent_case_users');
                    fields = fields.split(',');
                    for (var i in fields) {
                        var fieldName = new GlideRecord('sn_hr_core_service_approval_option');
                        fieldName.get(fields[i]);
                        parent = gr.parent.getRefRecord();
                        var field = parent.getElement(fieldName.getValue('approval_assign_to')).getRefRecord();
                        if (field.getTableName() == 'sys_user') {
                            // If anyone in recipients doesn't have access to the record, the chat will be peer to peer
                            if (!hr_Task.canEditTask(field.getUniqueValue()))
                                options.type = 'user';
                            recipients = this._addUserToRecipients(field.getUniqueValue(), recipients);
                        } else if (field.getTableName() == 'sys_user_group') {
                            groupUsers = this._addUserFromGroup(field.getUniqueValue(), recipients, hr_Task);
                            recipients = groupUsers.userList;
                            options.type = options.type != 'user' ? groupUsers.chatType : options.type;
                        }
                    }
                }
                if (!gs.nil(gr.getValue('groups'))) {
                    var groups = gr.getValue('groups');
                    groups = groups.split(',');
                    for (var grp in groups) {
                        groupUsers = this._addUserFromGroup(groups[grp], recipients, hr_Task);
                        recipients = groupUsers.userList;
                        options.type = options.type != 'user' ? groupUsers.chatType : options.type;
                    }
                }
            }

            if (gs.nil(options.queue) && gs.nil(recipients)) {
                options.type = 'record';
                parent = gr.parent.getRefRecord();
                recipients = this._addUserToRecipients(parent.getValue('assigned_to'), recipients);
            }
            recipients = this._addUserToRecipients(gr.getValue('assigned_to'), recipients);
            options.recipients = recipients;
        } else if (gr.sys_class_name == 'sn_doc_task') {
            // For document task, connect to parent case assigned to or assignment group.
            parent = gr.parent.getRefRecord();
            if (parent && parent.getValue('assigned_to')) {
                options.type = 'record';
                options.recipients = parent.getValue('assigned_to');
            } else if (parent && parent.assignment_group) {
                recipients = '';
                options.type = 'user';
                var groupGr = new GlideRecord('sys_user_grmember');
                groupGr.addQuery('group', parent.assignment_group);
                groupGr.query();
                while (groupGr.next())
                    recipients = this._addUserToRecipients(groupGr.getValue('user'), recipients);
                options.recipients = recipients;
            } else
                gs.error('assigned_to and assignment_group not present for parent of document task: {0}',
                    gr.getUniqueValue());
        } else { //Chat for non hr tasks always go to assigned to
            if (this._isCase(gr.getValue('sys_class_name')))
                options.title = gs.getMessage('Ask a question about this case');
            else
                options.title = gs.getMessage('Ask a question about this task');
            options.type = 'record';
            options.recipients = gr.getValue('assigned_to');
        }
        return options;
    },

    isConnectUsed: function(task) {
        var gr = new GlideRecord('live_group_profile');
        gr.addQuery('document', task);
        gr.query();
        if (gr.next())
            return true;
        var grChatEntry = new GlideRecord('chat_queue_entry');
        grChatEntry.addQuery('owner_id', task);
        grChatEntry.addEncodedQuery('stateIN1,2');
        grChatEntry.query();
        if (grChatEntry.next())
            return true;

        return false;
    },

    _addUserFromGroup: function(grp, recipients, hr_Task) {
        var group = new GlideRecord('sys_user_grmember');
        var type = 'record';
        group.addQuery('group', grp);
        group.query();
        while (group.next()) {
            // If anyone in group doesn't have access to the record, the chat will be peer to peer
            if (!hr_Task.canEditTask(group.getValue('user')))
                type = 'user';

            recipients = this._addUserToRecipients(group.getValue('user'), recipients);
        }

        return {
            chatType: type,
            userList: recipients
        };
    },

    _addUserToRecipients: function(user, recipients) {
        if (gs.nil(user))
            return;

        if (gs.nil(recipients))
            recipients = user;
        else if (recipients.indexOf(user) < 0)
            recipients += ',' + user;
        return recipients;
    },

    _isActivitySetActive: function(state) {
        return (state == 'running_activities' || state == 'finished');
    },

    /*
     ** check if the current activity set needs to be skipped.
     *** if activity-set-context state is `skipped`
     *** if it is opened for view, the activity set needs to be skipped
     ****      if the display_to_opened_for in activity set is set to false
     *** if it is subject person view, the activity set needs to be skipped
     ****      if the display_to_subject_person is false or "display is not allowed for subject person"
     *** otherwise, the current activity set should not be skipped.
     */
    _hideActivitySet: function(grContext) {
        var hideOpenedFor = !grContext.activity_set.display_to_opened_for;
        var hideSubjectPerson = !grContext.activity_set.display_to_subject_person;

        if (grContext.state == 'skipped')
            return true;

        //if the case is for both "opened for" and "subjectr person", only hide the acticity set when both hide
        // conditions are true
        if (this._isOpenedForView(grContext.hr_case) && this._isSubjectPersonView(grContext.hr_case))
            return hideOpenedFor && hideSubjectPerson;

        //if the case is for opened for only, check the hide option for opened for only
        if (this._isOpenedForView(grContext.hr_case) && !this._isSubjectPersonView(grContext.hr_case))
            return hideOpenedFor;

        //if the case is for subject person only, check the hide option for subject person only.
        if (!this._isOpenedForView(grContext.hr_case) && this._isSubjectPersonView(grContext.hr_case))
            return hideSubjectPerson;

        return false;
    },

    // private function that takes an HR case parameter
    _isOpenedForView: function(gr) {
        if (gs.nil(gr))
            return false;
        var opened_for = String(gr.opened_for);
        return opened_for == this._user;
    },

    // private function that takes an HR case parameter
    _isSubjectPersonView: function(gr) {
        if (gs.nil(gr))
            return false;
        var subject_person = String(gr.subject_person);
        return subject_person == this._user;
    },

    // private function that takes an HR case parameter
    _allowDisplayActivitySet: function(gr) {
        if (gs.nil(gr))
            return false;
        if (!gs.nil(gr.hr_service.fulfillment_type) && gr.hr_service.fulfillment_type == 'lifecycle_event') {
            if (!gs.nil(gr.hr_service.le_type) && gr.hr_service.le_type.display_activity_set)
                return true;
        }

        return false;
    },

    // private function that takes an HR case parameter
    _allowDisplayActivitySetToSubjectPerson: function(gr) {
        if (gs.nil(gr))
            return false;
        else
            return this._isSubjectPersonView(gr) && gr.hr_service.subject_person_access &&
                this._allowDisplayActivitySet(gr);
    },

    _isCase: function(tableName) {
        return hr_PortalUtil._hrCaseTables.indexOf(tableName) >= 0;
    },

    /**
     * Remove the unwanted speacial characters from the String
     * Characters inside regex array will be removed from string.
     */
    sanitize: function(str) {
        var cleanStr = str.replace(/[()]/g, '');
        return cleanStr;
    },

	disableVAForEmployeeCenter: function() {
		var gr = new GlideRecord("sp_agent_chat_config");
		if (gr.get("2f3c06b41b5570108d16ca64604bcbd0")) {
			gr.active = false;
			gr.update();
		}
		gr = new GlideRecord("sp_agent_chat_config");
		if (gr.get("305eb5d8534000102905ddeeff7b1211")) {
			gr.active = false;
			gr.update();
		}
	},

    type: 'hr_PortalUtil'
};
