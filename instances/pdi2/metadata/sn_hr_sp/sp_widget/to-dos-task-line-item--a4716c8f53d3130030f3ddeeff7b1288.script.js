(function() {
    data.CONST = {
        i18n: {
            BUTTON: {
                CANCEL: gs.getMessage("Cancel"),
                DELETE: gs.getMessage("Delete"),
                SUBMIT: gs.getMessage("Save")
            },
            DELEGATE: gs.getMessage("Delegate"),
            DELEGATE_COUNT: gs.getMessage("Delegate ({})"),
            DELEGATE_SINGLE_TASK: gs.getMessage("Delegate this task"),
            MODAL_TITLE: gs.getMessage("Select the person to do this task for you"),
            VIEW_ALL: gs.getMessage("View all"),
            VIEW_PROFILE: gs.getMessage("View {} profile"),
            BUTTON_TITLE: {
                ADD: gs.getMessage("Add delegate for this task"),
                EDIT: gs.getMessage("Edit delegate"),
                VIEW_ALL: gs.getMessage("View all delegates for this task")
            }
        },
        AHC_TASK_TABLES: {
            RITM_TABLE: "sc_req_item",
            REQ_TABLE: "sc_request",
            DOC_TASK_TABLE: "sn_doc_task",
            HR_TASK_TABLE: "sn_hr_core_task"
        },
        OTHER_APPROVAL_TABLES: {
            APPROVALS: "sysapproval_approver",
            KB_KNOWLEDGE: "kb_knowledge"
        }
    };
    // DOC_TASK_TABLE and HR_TASK_TABLE specifically excluded from list, AHC is handled separately
    data.CONST.AHC_TABLE_LIST = [
        data.CONST.AHC_TASK_TABLES.RITM_TABLE,
        data.CONST.AHC_TASK_TABLES.REQ_TABLE
    ];
    var isHrCoreActive = new GlidePluginManager().isActive("com.sn_hr_core");
    var isLegalActiveAndUpgraded = isLegalPluginActiveAndUpgraded();
    var isEmpGenAiActive = isEmpGenAiActiveAndUpgraded();
    var legalTodoUtils = isLegalActiveAndUpgraded ? new sn_lg_ops.LegalRequestTodosUtil() : null;
    var showAHCForHRTask = false;
    var showAHCForDocTask = false;
    var showAHCForLegalTask = false;
    var showAHCForGpTask = false;

    if (input) {
        delegateTask(input);
        data.userId = gs.getUserID();
        data.isMobile = gs.isMobile();
        data.optionalLabel = input.optionalLabel;
        data.sysId = input.sysId;
        data.tableName = input.tableName;
        data.displayValueList = input.displayValueList;
        data.dueDateDisplayValue = input.dueDateDisplayValue;
        data.isCompleted = input.isCompleted;
        data.todoNumber = input.todoNumber;
        data.state = input.state;
        data.state_num_value = input.state_num_value;
        data.stateLabel = input.stateLabel;
        data.url = input.url;
        data.todoConfigurationSysId = input.todoConfigurationSysId;
        data.widgetMappings = input.widgetMappings;
        data.onTicketPage = input.onTicketPage || false;
        data.onTodoPage = input.onTodoPage || true;
        data.widgetToRender = "";
        data.isHRCase = input.isHRCase || false;
        data.currentIndex = input.currentIndex;
        data.totalTodos = input.totalTodos;
        data.taskType = input.taskType;
        data.future = input.future;
        data.assigned_to_id = input.assigned_to_id;
        data.isApprovalTable = input.isApprovalTable;
        data.hrmToDoUrl = new sn_hr_sp.MessagingAppTodoPageUtils().getTodoTaskUrl(input.tableName, input.sysId);
        data.redirectionNeeded = new sn_hr_sp.MessagingAppTodoPageUtils().redirectionNeeded(input.tableName, input.sysId);
        //The acceptance todo has a different uniqueID. Extract the sysid
        data.sysId = (data.onTicketPage && data.taskType == 'acceptance') ? data.sysId.split("_")[0] : data.sysId;
        var todoLineRecordGr = new GlideRecord(data.tableName);
        if (!data.future && todoLineRecordGr.get(data.sysId) && todoLineRecordGr.canRead()) {
            var coreUtils = isHrCoreActive ? new sn_hr_core.hr_CoreUtils() : null;
            var ticketSource = getTicketSource(todoLineRecordGr);
            data.taskTable = ticketSource.sourceTable;
            data.taskSysId = ticketSource.sourceSysId;
            data.validNonHrTask = data.CONST.AHC_TABLE_LIST.indexOf(data.taskTable) > -1;
            data.validApproval = ticketSource.showApprovalActivityStream;
            data.approvalChildTask = data.validApproval ? ticketSource.childTask : undefined;
            var summarizationTable = data.approvalChildTask ? data.approvalChildTask.taskTable : data.taskTable;
            var summarizationSysId = data.approvalChildTask ? data.approvalChildTask.taskSysId : data.taskSysId;
            data.aiSummaryWidget = getAISummaryWidget(isEmpGenAiActive, data.isCompleted, summarizationTable, summarizationSysId);
            data.attachmentsGr = ticketSource.attachmentsGr ? ticketSource.attachmentsGr : todoLineRecordGr;
            var todoLineWidgetId = getTodoLineWidgetID(data.widgetMappings, todoLineRecordGr);
            if (todoLineWidgetId) {
                data.widgetToRender = $sp.getWidget(todoLineWidgetId, getTodoLineWidgetInput(ticketSource));
                var ahcHistoryWidgetInput = getAhcHistoryWidgetInput(ticketSource);
                // Show ahc for document task only if parent is HR case.
                if (data.tableName == data.CONST.AHC_TASK_TABLES.DOC_TASK_TABLE && isHrCoreActive) {
                    var docTaskGr = new GlideRecord(data.CONST.AHC_TASK_TABLES.DOC_TASK_TABLE);
                    if (docTaskGr.get(data.sysId) && coreUtils.isCase(docTaskGr.parent.sys_class_name) && docTaskGr.canRead())
                        showAHCForDocTask = true;
                } else if (data.tableName == data.CONST.AHC_TASK_TABLES.HR_TASK_TABLE && isHrCoreActive) {
                    showAHCForHRTask = true;
                    data.showAttachmentsHR = true;
                } else if (isLegalActiveAndUpgraded && !gs.nil(ticketSource.childTask) && legalTodoUtils.isValidLegalTodoApprovalTable(ticketSource.childTask.taskTable)) {
                    showAHCForLegalTask = true;
                } else if (data.tableName === 'sn_egd_core_plan_activity') {
                    showAHCForGpTask = !isGPActivityTabsPresent();
                }

                // Show ahc for the following approval types
                if (showAHCForHRTask || data.validNonHrTask || data.validApproval || showAHCForDocTask || showAHCForLegalTask || showAHCForGpTask) {
                    //ahc is attachment history and chat widgets
                    data.ahcWidget = {
                        lazy: {
                            name: 'hrm-task-ahc-widget',
                            options: ahcHistoryWidgetInput
                        }
                    };
                    data.historyWidget = {
                        lazy: {
                            name: 'std_ticket_conversations',
                            options: ahcHistoryWidgetInput
                        }
                    };
                    // Initializing attachments gallery for legal if not adhoc attachment approval
                    if (showAHCForLegalTask && !gs.nil(ticketSource.childTask) && !ticketSource.childTask.isAdhocAttachementApproval) {
                        setAttachmentsGalleryWidget(ticketSource.childTask.legalTaskGr);
                    }
                    //Initializing attachments gallery for everything except HR Doc Tasks
                    else if (!showAHCForDocTask) {
                        setAttachmentsGalleryWidget(data.attachmentsGr);
                    }
                }

            }
        } else if (data.future) {
            var widgetOptions = {};
            widgetOptions.assigned_to_id = data.assigned_to_id;
            data.widgetToRender = $sp.getWidget(getTodoLineWidgetID(data.widgetMappings), widgetOptions);
        }
    } else if (options) {
        data.widgetToRender = "default-todo-line-item-widget";
        data.tableName = options.tableName;
        data.sysId = options.sysId;
        data.todoSysId = options.todo_sys_id;
        data.onTicketPage = false;
        data.hrmToDoUrl = new sn_hr_sp.MessagingAppTodoPageUtils().getTodoTaskUrl(data.tableName, data.sysId);
        data.redirectionNeeded = new sn_hr_sp.MessagingAppTodoPageUtils().redirectionNeeded(data.tableName, data.sysId);
        todoLineRecordGr = new GlideRecord(data.tableName);
        var todoDetails = new sn_hr_sp.todoPageUtils().getTodoDetails(data.tableName, data.sysId, data.todoSysId);
        if (todoLineRecordGr.get(data.sysId) && !gs.nil(todoDetails) && todoLineRecordGr.canRead()) {
            coreUtils = isHrCoreActive ? new sn_hr_core.hr_CoreUtils() : null;
            ticketSource = getTicketSource(todoLineRecordGr);
            data.displayValueList = todoDetails.displayValueList;
            data.url = todoDetails.url;
            data.dueDateDisplayValue = todoDetails.dueDateDisplayValue;
            data.isCompleted = todoDetails.isCompleted;
	    data.stateLabel = todoDetails.stateLabel;
            data.todoNumber = todoDetails.todoNumber;
            data.taskTable = ticketSource.sourceTable;
            data.taskSysId = ticketSource.sourceSysId;
            data.validNonHrTask = data.CONST.AHC_TABLE_LIST.indexOf(data.taskTable) > -1;
            data.validApproval = ticketSource.showApprovalActivityStream;
            data.approvalChildTask = data.validApproval ? ticketSource.childTask : undefined;
            data.aiSummaryWidget = getAISummaryWidget(isEmpGenAiActive, data.isCompleted, data.taskTable, data.taskSysId);
            data.attachmentsGr = ticketSource.attachmentsGr ? ticketSource.attachmentsGr : todoLineRecordGr;
            if (!todoDetails.todoWidgetId)
                todoDetails.todoWidgetId = 'hrm-task-activity';
            data.widgetToRender = $sp.getWidget(todoDetails.todoWidgetId, getTodoLineWidgetInput(ticketSource));
            delegateTask(options);
            data.userId = gs.getUserID();
            ahcHistoryWidgetInput = getAhcHistoryWidgetInput(ticketSource);
            // Show ahc for document task only if parent is HR case.
            if (data.tableName == data.CONST.AHC_TASK_TABLES.DOC_TASK_TABLE && isHrCoreActive) {
                docTaskGr = new GlideRecord(data.CONST.AHC_TASK_TABLES.DOC_TASK_TABLE);
                if (docTaskGr.get(data.sysId) && coreUtils.isCase(docTaskGr.parent.sys_class_name) && docTaskGr.canRead())
                    showAHCForDocTask = true;
            } else if (data.tableName == data.CONST.AHC_TASK_TABLES.HR_TASK_TABLE && isHrCoreActive) {
                showAHCForHRTask = true;
                data.showAttachmentsHR = true;
            } else if (isLegalActiveAndUpgraded && !gs.nil(ticketSource.childTask) && legalTodoUtils.isValidLegalTodoApprovalTable(ticketSource.childTask.taskTable)) {
                showAHCForLegalTask = true;
            } 
            // Show ahc for the following approval types
            if (showAHCForHRTask || data.validNonHrTask || data.validApproval || showAHCForDocTask || showAHCForLegalTask) {
                //ahc is attachment history and chat widgets
                data.ahcWidget = {
                    lazy: {
                        name: 'hrm-task-ahc-widget',
                        options: ahcHistoryWidgetInput
                    }
                };
                data.historyWidget = {
                    lazy: {
                        name: 'std_ticket_conversations',
                        options: ahcHistoryWidgetInput
                    }
                };
                // Initializing attachments gallery for legal if not adhoc attachment approval
                if (showAHCForLegalTask && !gs.nil(ticketSource.childTask) && !ticketSource.childTask.isAdhocAttachementApproval) {
                    setAttachmentsGalleryWidget(ticketSource.childTask.legalTaskGr);
                }
                //Initializing attachments gallery for everything except HR Doc Tasks
                else if (!showAHCForDocTask)
                    setAttachmentsGalleryWidget(data.attachmentsGr);
            }
        }
    }
})();

/**
 * This method is to setup grannular delegation related parameters for the widget
 * and perform delegation (create/edit/delete) based on the current action
 *
 * @param obj can be input/options from the widget
 * the key info this method needs from obj is current to-do's sysId, tableName and delegation transport obj
 *
 * parameters updated:
 *     data.isGranularDelegationActive
 *     data.canDelegateRecord
 *     data.active_duty_available 
 *     data.currentDelegates
 *
 */
function delegateTask(obj) {
    // check if granular delegation plugin is active
    data.isGranularDelegationActive = GlidePluginManager().isActive('com.glide.granular_service_delegation');
    // only perform if granular delegation plugin is active
    if (data.isGranularDelegationActive) {
        var granularDelegateUtils = new global.Delegation();
        var record = new GlideRecord(obj.tableName);
        data.canDelegateRecord = (obj.sysId && record.get(obj.sysId) && record.isValid() && record.canRead()) ? granularDelegateUtils.canDelegateRecord(record) : false;
        // check for active rules
        data.active_duty_available = granularDelegateUtils.checkUserHasActiveDelegationRule();
        // if rules are available, get assigned delegates
        if (data.active_duty_available)
            data.currentDelegates = granularDelegateUtils.getSingleRecordDelegate(
                obj.sysId,
                obj.tableName
            );
        if (obj.transport) {
            if (obj.transport.action === "createOrEditSingleRecordDelegate")
                granularDelegateUtils.createOrEditSingleRecordDelegate(
                    obj.sysId,
                    obj.tableName,
                    obj.transport.delegates
                );
            else if (obj.transport.action === "deleteSingleRecordDelegate")
                granularDelegateUtils.deleteSingleRecordDelegate(
                    obj.sysId,
                    obj.transport.delegation_record_id
                );
            return;
        }
    }
}

function isGPActivityTabsPresent() {
	var gpTabsWidget = new GlideRecord("sp_widget");
	gpTabsWidget.addQuery("sys_id" ,"4ebfc6f777445210e2cd4d989e5a996a");
	gpTabsWidget.query();
	return gpTabsWidget.hasNext();
}

function getTodoLineWidgetID(widgetMappings, recordGr) {
    if (widgetMappings) {
        for (var i = 0; i < widgetMappings.length; i++) {
            if (!widgetMappings[i].condition)
                return widgetMappings[i].widgetId;
            // If source_table is empty, temporarily fill it with legacy sysapproval reference table
            // This will allow the source_table filter to work on approvals that have been manually created
            if (!recordGr.source_table && !recordGr.document_id && recordGr.sysapproval)
                recordGr.source_table = recordGr.sysapproval.getRefRecord().getTableName();
            var resBoolValue = GlideFilter.checkRecord(recordGr, widgetMappings[i].condition);
            if (resBoolValue)
                return widgetMappings[i].widgetId;
        }
    }
    return "default-todo-line-item-widget";
}

function setAttachmentsGalleryWidget(attachmentsTaskGr) {
    var isCaseOrTaskOpen = true;
    if (attachmentsTaskGr.getValue('state') == '3' || attachmentsTaskGr.getValue('state') == '4' || attachmentsTaskGr.getValue('state') == '7')
        isCaseOrTaskOpen = false;
    data.ticketAttachmentGalleryWidget = $sp.getWidget('widget-ticket-attachment-gallery', {
        ticket_sys_id: attachmentsTaskGr.getUniqueValue(),
        ticket_table: attachmentsTaskGr.getTableName(),
        can_attach: false, // upload always disabled in SP
        can_write: attachmentsTaskGr.canWrite() && isCaseOrTaskOpen,
        can_read: attachmentsTaskGr.canRead(),
        profiles: [{
            condition: {
                breakpoint: data.isMobile ? 9e9 : 767 // viewportWidth < 767px: mobile device or small screen
            },
            options: {
                empty_list_text: gs.getMessage('There are no attachments'),
                max_thumbnails: 10
            }
        }, {
            condition: {
                breakpoint: 1200 // viewportWidth < 1200px: Desktops, medium screens
            },
            options: {
                max_thumbnails: 2
            }
        }]
    });
}

function getTicketSource(todoGr) {
    var result = {
        "sourceTable": "",
        "sourceSysId": "",
        "showApprovalActivityStream": false,
        "childTask": null,
        "attachmentsGr": null
    };
    var isHrCoreActive = new GlidePluginManager().isActive("com.sn_hr_core");
    var coreUtils = isHrCoreActive ? new sn_hr_core.hr_CoreUtils() : null;
    var isLegalActiveAndUpgraded = isLegalPluginActiveAndUpgraded();
    var legalTodoUtils = isLegalActiveAndUpgraded ? new sn_lg_ops.LegalRequestTodosUtil() : null;
    var taskResult;
    if (data.tableName !== data.CONST.OTHER_APPROVAL_TABLES.APPROVALS) {
        result.sourceTable = data.tableName;
        result.sourceSysId = data.sysId;
    } else {
        taskResult = getTaskFromApproval(todoGr);
        result.sourceTable = taskResult.taskTable;
        result.sourceSysId = taskResult.taskSysId;
        // If REQ, change displayed activity stream to either Approval or single RITM
        if (result.sourceTable === data.CONST.AHC_TASK_TABLES.REQ_TABLE) {
            // Attachment widget should always display REQ attachments
            result.attachmentsGr = new GlideRecord(result.sourceTable);
            if (!(result.attachmentsGr.get(result.sourceSysId) && result.attachmentsGr.canRead())) {
                gs.warn("To-dos Task Line Item: Could not find referenced REQ record, using parent approval instead");
                result.attachmentsGr = null;
            }
            // Activity Stream widget source varies on number of associated RITMs...
            var ritmGr = new GlideRecord(data.CONST.AHC_TASK_TABLES.RITM_TABLE);
            ritmGr.addQuery("request", result.sourceSysId);
            ritmGr.query();
            if (ritmGr.canRead()) {
                if (ritmGr.getRowCount() === 1) {
                    // Show the RITM Stream
                    ritmGr.next();
                    result.sourceTable = data.CONST.AHC_TASK_TABLES.RITM_TABLE;
                    result.sourceSysId = ritmGr.getUniqueValue();
                } else {
                    // Show the Approval Stream, also pass child task REQ since hr_PortalUtil needs a task record
                    result.sourceTable = data.CONST.OTHER_APPROVAL_TABLES.APPROVALS;
                    result.sourceSysId = data.sysId;
                    result.showApprovalActivityStream = true;
                    result.childTask = {
                        "taskTable": data.CONST.AHC_TASK_TABLES.REQ_TABLE,
                        "taskSysId": result.sourceSysId
                    };
                }
            }
        } else if (result.sourceTable === data.CONST.AHC_TASK_TABLES.RITM_TABLE) {
            // Show RITM Stream for RITM Approvals
            result.sourceTable = taskResult.taskTable;
            result.sourceSysId = taskResult.taskSysId;
            result.attachmentsGr = new GlideRecord(result.sourceTable);
            if (!(result.attachmentsGr.get(result.sourceSysId) && result.attachmentsGr.canRead())) {
                gs.warn("To-dos Task Line Item: Could not find referenced task record, using parent approval instead");
                attachmentsGr = null;
            }
        } else if (isHrCoreActive && coreUtils.isCase(result.sourceTable)) {
            // Show Approval Stream for HR Cases
            result.sourceTable = data.CONST.OTHER_APPROVAL_TABLES.APPROVALS;
            result.sourceSysId = data.sysId;
            result.showApprovalActivityStream = true;
            result.childTask = {
                "taskTable": taskResult.taskTable,
                "taskSysId": taskResult.taskSysId
            };
        } else if (isLegalActiveAndUpgraded && legalTodoUtils.isValidLegalTodoApprovalTable(taskResult.taskTable)) {
            return legalTodoUtils.getLegalTicketSource(taskResult, data);
        } else {
            // Write Approve/Reject comments to Approval Stream
            result.sourceTable = data.CONST.OTHER_APPROVAL_TABLES.APPROVALS;
            result.sourceSysId = data.sysId;
        }
    }
    return result;
}

function getTaskFromApproval(approvalGr) {
    // Check for document_id field populated, if not, use legacy sysapproval
    var result = {};
    result.taskTable = approvalGr.document_id.getReferenceTable();
    if (result.taskTable) {
        // Use document_id field
        result.taskSysId = approvalGr.document_id.toString();
    } else {
        // Use the sysapproval field (must convert to GlideRecord to get correct extended table)
        result.taskTable = approvalGr.sysapproval.getRefRecord().getTableName();
        result.taskSysId = approvalGr.sysapproval.toString();
    }
    return result;
}

function getTodoLineWidgetInput(ticketSource) {
    var result = {};
    result.sysId = data.sysId;
    result.sys_id = data.sysId;
    result.table = data.tableName;
    result.taskSysId = data.taskSysId;
    result.taskTable = data.taskTable;
    // Line 362 is commented as fix of DEF0269556. Did not find any usages of this in called widgets
    //result.taskGr = data.attachmentsGr;
    result.todoNumber = data.todoNumber;
    result.url = data.url;
    result.todoTitle = (data.displayValueList && data.displayValueList.length) ? data.displayValueList[0] : '';
    result.btnLabel = gs.getMessage('Post');
    result.placeholder = gs.getMessage('Add an optional comment');
    result.commentId = ticketSource.sourceSysId;
    result.commentTable = ticketSource.sourceTable;
    return result;
}

function getAhcHistoryWidgetInput(ticketSource) {
    var result = {};
    result.sysId = ticketSource.sourceSysId;
    result.assigned_to_id = data.assigned_to_id;
    result.future = data.future;
    result.sys_id = ticketSource.sourceSysId;
    result.table = ticketSource.sourceTable;
    result.validNonHrTask = data.validNonHrTask;
    result.validApproval = data.validApproval;
    result.approvalChildTask = data.approvalChildTask;
    result.todoNumber = data.todoNumber;
    result.url = data.url;
    result.todoTitle = (data.displayValueList && data.displayValueList.length) ? data.displayValueList[0] : '';
    result.btnLabel = gs.getMessage('Post');
    result.onTicketPage = data.onTicketPage;
    result.placeholder = gs.getMessage('Add an optional comment');
    return result;
}

// For upgrade scenarios where legal plugin does`nt support AHC widgets
function isLegalPluginActiveAndUpgraded() {
    var isLegalPluginActive = new GlidePluginManager().isActive("com.sn_lg_ops");
    try {
        if (isLegalPluginActive && new sn_lg_ops.LegalRequestTodosUtil()) {
            return isLegalPluginActive;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function isEmpGenAiActiveAndUpgraded() {
    var pluginActive = new GlidePluginManager().isActive("com.sn_ex_gen_ai");
    try {
        if (pluginActive && new sn_ex_gen_ai.PortalTaskSummarize()) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

function getAISummaryWidget(isEmpGenAiActive, isTaskComplete, table, sysId) {
    if (!isEmpGenAiActive || !table || !sysId) {
        return false;
    }
    return $sp.getWidget('ai-record-summary', {
        table: table,
        sys_id: sysId,
        isTaskComplete: isTaskComplete
    });
}
