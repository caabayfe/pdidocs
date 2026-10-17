/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    /**
     * Helper Function
     * 
     * Default upcoming slot data template
     */
    const getUpcomingSlotTemplate = () => {
        return {
            actionPayloadBinding: {},
            data: {
                status: "",
                timer: {
                    value: "",
                    show: false,
                    isIncremental: false,
                    color: "green",
                    fieldName: "Due in"
                },
                sysId: "",
                title: "",
                type: {
                    value: "",
                    show: false,
                }
            },
            overFlowActions: [],
            showAction: false
        };
    };

    /**
     * Helper Function
     * 
     * Build Upcoming slot data from the controller output
     */
    const buildUpcomingSlotData = async (upcomingTasksData) => {
        const upcomingSlotData = [];
        for (const index in upcomingTasksData) {
            const upcomingTaskData = upcomingTasksData[index];
            const upcomingResultantObject = getUpcomingSlotTemplate();
            upcomingResultantObject.showAction = upcomingTaskData.isLeader;
            upcomingResultantObject.actionPayloadBinding = {
                modalTitle: {
                    "type": "UX_BINDING",
                    "value": "title"
                },
                sysId: {
                    "type": "UX_BINDING",
                    "value": "sysId"
                },
                table: {
                    "type": "JSON_LITERAL",
                    "value": "incident_alert_task"
                },
            };
            upcomingResultantObject.overFlowActions = [];
            if (upcomingTasksData[index].canStart) {
                upcomingResultantObject.overFlowActions.push({
                    label: await helpers.translate("Start Task"),
                    id: "start",
                    payloadBinding: {
                        commTaskId: {
                            type: "UX_BINDING",
                            value: "sysId"
                        },
                        action: {
                            type: "JSON_LITERAL",
                            value: "start"
                        }
                    }
                });
            }
            if (upcomingTasksData[index].canSnooze) {
                upcomingResultantObject.overFlowActions.push({
                    label: await helpers.translate("Snooze"),
                    id: "snooze",
                    payloadBinding: {
                        commTaskId: {
                            type: "UX_BINDING",
                            value: "sysId"
                        },
                        action: {
                            type: "JSON_LITERAL",
                            value: "snooze"
                        }
                    }
                });
            }
            if (upcomingTasksData[index].permissions.manage_recipients) {
                upcomingResultantObject.overFlowActions.push({
                    label: await helpers.translate("Manage Participants"),
                    id: "manage_participants",
                    payloadBinding: {
                        type: {
                            type: "JSON_LITERAL",
                            value: "collaborationTask"
                        },
                        table: {
                            "type": "JSON_LITERAL",
                            "value": "incident_alert"
                        },
                        sysId: {
                            type: "UX_BINDING",
                            value: "commPlanSysId"
                        }
                    }
                });
            }
            upcomingResultantObject.overFlowActions.push({
                label: await helpers.translate("View Record"),
                id: "view_record",
                payloadBinding: {
                    table: {
                        "type": "JSON_LITERAL",
                        "value": "incident_alert_task"
                    },
                    sysId: {
                        type: "UX_BINDING",
                        value: "sysId"
                    }
                }
            });
            if (upcomingTasksData[index].canClose) {
                upcomingResultantObject.overFlowActions.push({
                    label: await helpers.translate("Close"),
                    id: "close",
                    payloadBinding: {
                        commTaskId: {
                            type: "UX_BINDING",
                            value: "sysId"
                        },
                        action: {
                            type: "JSON_LITERAL",
                            value: "close"
                        }
                    }
                });
            }
            upcomingResultantObject.data.formattedStatus = upcomingTaskData.formattedStatus;
            upcomingResultantObject.data.sysId = upcomingTaskData.sys_id.value;
            upcomingResultantObject.data.commPlanSysId = upcomingTaskData.commPlanSysId;
            upcomingResultantObject.data.commChannelSysId = upcomingTaskData.channels[0].sys_id.value;
            if (upcomingTaskData.due_date.value && upcomingTaskData.due_date.value.length > 0) {
                upcomingResultantObject.data.timer.show = true;
                upcomingResultantObject.data.timer.value = new Date(upcomingTaskData.due_date.value).valueOf();
            }
            if (upcomingTaskData.statusGroup === "Overdue") {
                upcomingResultantObject.data.timer.isIncremental = true;
                upcomingResultantObject.data.timer.color = "critical";
                upcomingResultantObject.data.timer.fieldName = "Past due";
                upcomingResultantObject.data.type.value = upcomingTaskData.statusGroup;
                upcomingResultantObject.data.type.show = true;

            }
            upcomingResultantObject.data.title = upcomingTaskData.short_description.display_value;
            upcomingSlotData.push(upcomingResultantObject);
        }
        return upcomingSlotData;
    };

    /**
     * On initial Load and record watcher changes, rebuild the pending section and record watcher
     * injection sysId's
     * 
     * NOTE: Initial Load - the controller data is refreshed on Get Collab Routes Data Broker as there is
     * an existing issue with controller referesh on page load
     */
    const handleCollaborateUpcoming = async (controllerOuputData) => {
        if (!controllerOuputData) return;
        if (!controllerOuputData.status) return;
        const ictData = controllerOuputData.ICT_DATA;
        if (!ictData.commTasksByState) return;
        let upcomingTasksData = [];
        let allTasks = [];
        let commTaskSysIds = [];
        const commTasksByState = { ...ictData.commTasksByState
        };
        for (const index in commTasksByState) {
            let commTasks = commTasksByState[index].comm_tasks || [];
            commTasks = commTasks.filter(function(commTask) {
                return (commTask.collabType === "call");
            });
            if ((commTasksByState[index].name === "Upcoming") || (commTasksByState[index].name === "Overdue")) {
                upcomingTasksData = upcomingTasksData.concat(commTasks);
            }
            allTasks = allTasks.concat(commTasks);
        }
        for (const index in allTasks) {
            const commTask = allTasks[index];
            commTaskSysIds.push(commTask.sys_id.value);
        }

        const activeCalls = ictData.activeCalls || {};
        for (const key in activeCalls) {
            if (activeCalls[key].active.value == "false") continue;
            const sourceId = activeCalls[key].source.value;
            if (!sourceId) continue;
            commTaskSysIds.push(sourceId);
        }

        const upcomingTasksSlotData = await buildUpcomingSlotData(upcomingTasksData);
        api.setState("upcomingSlotData", upcomingTasksSlotData);
        api.setState("collaborationTaskIds", commTaskSysIds);
    };

    const controllerOuputData = { ...event.payload.controllerOutput
    };

    //Handle Collaborate Upcoming Data
    if (controllerOuputData.type == "ICT_DATA") {
        await handleCollaborateUpcoming(controllerOuputData);
    }

    if (api.state.routes.length == 0 && api.data.get_collab_routes.output) {
        api.setState("routes", api.data.get_collab_routes.output);
    }
}
