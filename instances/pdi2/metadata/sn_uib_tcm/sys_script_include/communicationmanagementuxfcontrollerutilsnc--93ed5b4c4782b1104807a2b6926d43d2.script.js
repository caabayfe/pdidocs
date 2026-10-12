var CommunicationManagementUXFControllerUtilSNC = Class.create();
CommunicationManagementUXFControllerUtilSNC.prototype = {
    initialize: function() {},

    TABLES: {
        INCIDENT_ALERT_TASK: {
            NAME: "incident_alert_task",
            FIELDS: {
                NAME: "STATE",
                VALUE: {
                    "pending": -5,
                    "open": 1,
                    "inProgress": 2,
                    "complete": 3,
                    "skipped": 7
                }
            }
        },
    },

    // comm_task state's orders to follow priority order for communication tasks as: active, overdue, upcoming, completed and skipped
    COMM_TASK_STATE_ORDER: {
        "2": 1, // in progress
        "-5": 2, // pending
        "1": 2, // open
        "3": 3, // completed
        "7": 4 // skipped
    },

    isTCMPluginActive: function() {
        return GlidePluginManager.isActive('com.snc.task_communication_management');
    },

    _sortCommunicationTasks: function(commTasks) {
        if (gs.nil(commTasks))
            return [];
        var commTaskStateOrders = this.COMM_TASK_STATE_ORDER;
        var stateValues = this.TABLES.INCIDENT_ALERT_TASK.FIELDS.VALUE;
        var inProgressValue = stateValues["inProgress"];
        var openValue = stateValues["open"];
        var pendingValue = stateValues["pending"];
        var completeValue = stateValues["complete"];
        var skippedValue = stateValues["skipped"];
        commTasks = commTasks.sort(function(task1, task2) {
            var state1 = task1.state.value;
            var state2 = task2.state.value;
            var stateOrder1 = commTaskStateOrders[state1];
            var stateOrder2 = commTaskStateOrders[state2];
            if (stateOrder1 != stateOrder2)
                return stateOrder1 - stateOrder2;
            else if (state1 == inProgressValue) {
                var lastCommSent1 = task1.last_communication.value;
                var lastCommSent2 = task2.last_communication.value;
                if (lastCommSent1 && lastCommSent2) {
                    var lastCommSentGDT1 = new GlideDateTime(lastCommSent1);
                    var lastCommSentGDT2 = new GlideDateTime(lastCommSent2);
                    return lastCommSentGDT2.compareTo(lastCommSentGDT1);
                }
                return lastCommSent2 ? 1 : (lastCommSent1 ? -1 : 0);
            } else if (state1 == openValue || state1 == pendingValue) {
                var dueDate1 = task1.due_date.value;
                var dueDate2 = task2.due_date.value;
                if (dueDate1 && dueDate2 && dueDate1 !== dueDate2) {
                    var dueDateGDT1 = new GlideDateTime(dueDate1);
                    var dueDateGDT2 = new GlideDateTime(dueDate2);
                    return dueDateGDT1.compareTo(dueDateGDT2);
                } else if (dueDate1 && !dueDate2) return -1;
                else if (dueDate2 && !dueDate1) return 1;
                var order1 = task1.order.value;
                var order2 = task2.order.value;
                if (order1 && order2) return order1 - order2;
                else if (order1) return -1;
                else if (order2) return 1;
                var desc1 = task1.short_description && task1.short_description.value;
                var desc2 = task2.short_description && task2.short_description.value;
                if (desc1 && desc2) return desc1.localeCompare(desc2);
                return 0;
            } else if (state2 == completeValue || state2 == skippedValue) {
                var updatedOn1 = task1.sys_updated_on.value;
                var updatedOn2 = task2.sys_updated_on.value;
                if (updatedOn1 && updatedOn2) {
                    var updatedOnGDT1 = new GlideDateTime(updatedOn1);
                    var updatedOnGDT2 = new GlideDateTime(updatedOn2);
                    return updatedOnGDT2.compareTo(updatedOnGDT1);
                }
                return updatedOn2 ? 1 : (updatedOn1 ? -1 : 0);
            }
            return 0;
        });
        return commTasks;
    },

    _getStatusGroupIndex: function(commTask) {
        if (gs.nil(commTask) || gs.nil(commTask.state))
            return;

        var state = commTask.state.value;
        var stateValues = this.TABLES.INCIDENT_ALERT_TASK.FIELDS.VALUE;
        if (state == stateValues["inProgress"])
            return 0;
        else if (state == stateValues["open"] || state == stateValues["pending"]) {
            var dueDateVal = commTask.due_date && commTask.due_date.value;
            if (dueDateVal) {
                var now = new GlideDateTime();
                var dueDate = new GlideDateTime(dueDateVal);
                return dueDate.compareTo(now) == -1 ? 1 : 2;
            }
            return 2;
        } else if (state == stateValues["complete"])
            return 3;
        else
            return 4;
    },

    _canInitiateSidebarDiscussionCommTask: function(commTaskTable, commTaskSysId) {
        if (gs.nil(commTaskTable) || gs.nil(commTaskSysId))
            return false;
        var gr = new GlideRecord(commTaskTable);
        if (!gr.get(commTaskSysId))
            return false;

        if (!gr.active) return false;

        var userId = gs.getUserID();
        var gUser = new global.IncidentUtils().getUserByIdObj(userId);

        if (gr.getRecordClassName() == 'incident_alert_task') {
            var hasItilRole = gUser.hasRole('itil,sn_incident_write');
            var isAssignedToUser = gr.assigned_to == userId;
            var isAlertAssignedToUser = gr.incident_alert.assigned_to == userId;
            if (hasItilRole && (isAssignedToUser || isAlertAssignedToUser)) {
                return true;
            }
        }
        return gUser.hasRole('sn_comm_management.comm_plan_manager') || gUser.hasRole('sn_comm_management.comm_plan_admin');
    },

    getCommunicationDetails: function(table, sysId) {
        if (!table || !sysId)
            return {};
        if (!this.isTCMPluginActive())
            return {};
        var commTaskHandler = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(table);
        var communicationDetails = commTaskHandler.getCommunicationDetails(sysId, {
            isCompact: true
        }) || {};
        var commPlans = (communicationDetails && communicationDetails.comm_plan) ? communicationDetails.comm_plan : [];
        communicationDetails["commTasksByState"] = [];
        communicationDetails["commTasksByPlan"] = [];

        if(commPlans.length == 0)
            return communicationDetails;

        var commTasks = [];
        var sowSidebarChatUtils = new sn_sow_collab.SOWSidebarChatUtils();

        for (var i = 0; commPlans && i < commPlans.length; i++) {
            var commPlan = commPlans[i];
            var communicationTasks = commPlans[i].comm_tasks || [];

            if (communicationTasks.length == 0)
                continue;

            var commPlanName = commPlan.short_description.value;
            var commPlanDisplayName = commPlan.short_description.display_value;
            var commPlanDefinition = commPlan.comm_plan_definition.value;
            var commPlanSysId = commPlan.sys_id.value;
            var permissions = communicationDetails.permissions;

            for (var j = 0; j < communicationTasks.length; j++) {
                var commTask = communicationTasks[j];
                var isSidebarDiscussionPresent = false;
                var commTaskChannels = commTask.channels || [];
                var commTaskClass = commTask.sys_class_name.value;
                var commTaskSysId = commTask.sys_id.value;

                for (var k = 0; k < commTaskChannels.length; k++) {
                    if (commTaskChannels[k].channelType.value == "sidebar-discussion") {
                        isSidebarDiscussionPresent = true;
                        break;
                    }
                }

                if (isSidebarDiscussionPresent && !sowSidebarChatUtils.isSidebarSupportedOnSOW(commTaskClass, commTaskSysId))
                    continue;
                if (isSidebarDiscussionPresent)
                    commTask.canInitiateSidebarDiscussion = this._canInitiateSidebarDiscussionCommTask(commTaskClass, commTaskSysId);

                commTask.commPlanName = commPlanName;
                commTask.commPlanDisplayName = commPlanDisplayName;
                commTask.commPlanSysId = commPlanSysId;
                commTask.commPlanDefinition = commPlanDefinition;
                commTask.isAdHoc = gs.nil(commPlanDefinition);
                commTask.permissions = permissions;
                commTask.last_communication.time_ago = this._getDuration(commTask.last_communication.value).toLocaleLowerCase();
                commTasks.push(commTask);
            }
        }

        if (commTasks.length == 0)
            return communicationDetails;

        commTasks = this._sortCommunicationTasks(commTasks);

        var commTasksByState = this._initCommTasksByState();
        var commTasksByPlan = [];
        var commPlanMap = {};

        commTasks.forEach(function(commTask) {
            var stateIndex = this._getStatusGroupIndex(commTask);
            commTask.statusGroup = commTasksByState[stateIndex].name;
            commTasksByState[stateIndex].comm_tasks.push(commTask);

            var isAdHoc = commTask.isAdHoc;
            var commPlanSysId = isAdHoc ? "ad_hoc_communications" : commTask.commPlanSysId;
            if (!commPlanMap[commPlanSysId]) {
                commTasksByPlan.push({
                    "name": isAdHoc ? "ad_hoc_communications" : commTask.commPlanName,
                    "displayName": isAdHoc ? gs.getMessage("Ad-hoc communications") : commTask.commPlanDisplayName,
                    "commPlanSysId": commPlanSysId,
                    "comm_tasks": []
                });
                commPlanMap[commPlanSysId] = commTasksByPlan.length;
            }
            commTasksByPlan[commPlanMap[commPlanSysId] - 1].comm_tasks.push(commTask);
        }, this);

        communicationDetails["commTasksByState"] = commTasksByState;
        communicationDetails["commTasksByPlan"] = commTasksByPlan;
        return communicationDetails;
    },

    _getDuration: function(gdt) {
        if (!gdt) return '';
        var now = new GlideDateTime();
        var past = new GlideDateTime(gdt);
        var duration = GlideDateTime.subtract(past, now);
        return duration.getDisplayValue().split(" ").slice(0, 2).join(" ");
    },

    _initCommTasksByState: function() {
        return [{
            "displayName": gs.getMessage("Active"),
            "name": "Active",
            "comm_tasks": []
        }, {
            "displayName": gs.getMessage("Overdue"),
            "name": "Overdue",
            "comm_tasks": []
        }, {
            "displayName": gs.getMessage("Upcoming"),
            "name": "Upcoming",
            "comm_tasks": []
        }, {
            "displayName": gs.getMessage("Complete"),
            "name": "Complete",
            "comm_tasks": []
        }, {
            "displayName": gs.getMessage("Skipped"),
            "name": "Skipped",
            "comm_tasks": []
        }];
    },

    type: 'CommunicationManagementUXFControllerUtilSNC'
};
