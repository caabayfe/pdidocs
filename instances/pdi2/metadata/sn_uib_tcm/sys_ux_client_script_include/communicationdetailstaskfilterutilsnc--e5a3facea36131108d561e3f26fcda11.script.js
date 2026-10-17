function include({ imports }) { 
    class CommunicationDetailsTaskFilterUtilSNC {
        static CONSTANTS = {
            FILTERS: {
                PLAN_FILTERS: {
                    COMMUNICATIONTASKS: "COMMUNICATIONTASKS",
                    COLLABORATIONTASKS: "COLLABORATIONTASKS",
                    COLLABORATIONTASKSCHAT: "COLLABORATIONTASKSCHAT",
                    COLLABORATIONTASKSCALL: "COLLABORATIONTASKSCALL",
                    ADHOCTASKS: "ADHOCTASKS",
                    ADHOCCOMMUNICATIONTASKS: "ADHOCCOMMUNICATIONTASKS",
                    ADHOCCOLLABORATIONTASKS: "ADHOCCOLLABORATIONTASKS",
                    ADHOCCOLLABORATIONTASKSCHAT: "ADHOCCOLLABORATIONTASKSCHAT",
                    ADHOCCOLLABORATIONTASKSCALL: "ADHOCCOLLABORATIONTASKSCALL",
                },
                DATA_FILETRS: {
                    DIRECTCHAT: "DIRECTCHAT",
                    DIRECTCALL: "DIRECTCALL",
                    SUPRESSCOMMPLANS: "SUPRESSCOMMPLANS",
                },
            },
            ICT_TASK_TYPE: "ICT_DATA",
            DIRECT_CHAT_DATA_TYPE: "DIRECT_CHAT",
            DIRECT_CALL_DATA_TYPE: "DIRECT_CALL",
            TASK_TYPE_COMMUNICATION: "communication",
            TASK_TYPE_COLLABORATION: "collaboration",
            COLLABTYPE_CALL: "call",
            COLLABTYPE_CHAT: "chat",
            RECORD_WATCHER_MESSAGE: "CONTROLLER_RECORD_WATCHER#MESSAGE_RECEIVED",
            TABLE: {
                COMM_CHANNEL_CONFERENCE: {
                    FIELDS: {
                        STATE: {
                            VALUE: {
                                STARTED: "started"
                            }
                        }
                    }
                },
                COMM_TASK: {
                    FIELDS: {
                        COMMUNICATION_FREQUENCY: {
                            VALUE: {
                                ONE_TIME: "one_time"
                            }
                        },
                        STATE: {
                            VALUE: {
                                OPEN: "1",
                                PENDING: "-5",
                                SKIPPED: "7"
                            }
                        }
                    }
                }
            }
        };

        static getOutputTemplate() {
            return {
                status: false,
                type: "",
                error_messages: [],
                success_messages: [],
                ICT_DATA: {},
            };
        }
        static async getTranslatedMessages(helpers) {
            const translatedMessages = {
                INVALID_INPUT_ERROR_MESSAGE: await helpers.translate("Task Sys Id (taskSysId), Task Table (taskTable) are mandatory Inputs"),
                INVALID_FILTERS_ERROR_MESSAGE: await helpers.translate( "communicationPlanIds, planFilters, dataFilters should be in Array Format"),
                ICT_DATA_PROCESSED_SUCCESS_MESSAGE: await helpers.translate( "ICT Data has been successfully processed"),
                DIRECT_CHAT_DATA_SUCCESS_MESSAGE: await helpers.translate( "Direct chat data has been fetched successfully" ),
                DIRECT_CALL_DATA_SUCCESS_MESSAGE: await helpers.translate( "Direct call data has been fetched successfully" ),
                ICT_DATA_PROCESSED_FAILURE_MESSAGE: await helpers.translate( "ICT data processing has failed. No results were found for the requested Task Sys ID" ),
                TCM_PLUGIN_NOT_INSTALLED: await helpers.translate( "Task communication management plugin is not installed" )
            };
            return translatedMessages;
        }

        static filteredDataOutput(api, outputObj) {
            api.emit("COMMUNICATION_DETAILS_DATA_FILTER_CONTROLLER_OUTPUT", {
                controllerOutput: outputObj,
            });
        }

        static evaluateFilterConditions(planFilters, inputFilters) {
            inputFilters = inputFilters.map(function (filter) {
                return filter.toUpperCase();
            });
            let filterConditions = {};
            planFilters.map(function (filter) {
                if (inputFilters.indexOf(filter) > -1) filterConditions[filter] = true;
                else filterConditions[filter] = false;
            });
            return filterConditions;
        }

        static async getFormattedStatus(commTask, helpers) {
            const commCount = Number(commTask.comm_count.value);
            switch (commTask.collabType) {
                case this.CONSTANTS.COLLABTYPE_CALL:
                    if (commTask.channels[0].state.value === this.CONSTANTS.TABLE.COMM_CHANNEL_CONFERENCE.FIELDS.STATE.VALUE.STARTED)
                        return await helpers.translate("In Session");
                    if (commCount > 0) {
                        if (commTask.communication_frequency.value === this.CONSTANTS.TABLE.COMM_TASK.FIELDS.COMMUNICATION_FREQUENCY.VALUE.ONE_TIME)
                            return await helpers.translate("Completed");
                        return await helpers.translate("Completed ({0}x)", commCount);
                    }
                    return await helpers.translate("Not started");
                case this.CONSTANTS.COLLABTYPE_CHAT:
                    if (commTask.active.value === "true")
                        return commTask.state.display_value;
                    if (commTask.state.value === this.CONSTANTS.TABLE.COMM_TASK.FIELDS.STATE.VALUE.OPEN || commTask.state.value === this.CONSTANTS.TABLE.COMM_TASK.FIELDS.STATE.VALUE.PENDING)
                        return await helpers.translate("Not started");
                    return await helpers.translate("Started");
                default:
                    if (commTask.state.value === this.CONSTANTS.TABLE.COMM_TASK.FIELDS.STATE.VALUE.SKIPPED)
                        return commTask.state.display_value;
                    if (commCount > 0) {
                        if (commTask.communication_frequency.value === this.CONSTANTS.TABLE.COMM_TASK.FIELDS.COMMUNICATION_FREQUENCY.VALUE.ONE_TIME)
                            return await helpers.translate("Sent");
                        return await helpers.translate("Sent ({0}x)", commCount);
                    }
                    return await helpers.translate("Not sent");
            }
        }

        /**
         * Build Filtered Data
         * @param commPlans 
         * @param plan filters 
         * Iterate over commplans and for each task in commPlan , if Task is communication will add taskType = "communication" in task object 
         * If Task is collab , taskType = "collaboration" is added to Task object along with it collabType ="call" / "chat" is added
         */
        static async buildFilteredDataForCommAndCollab(commPlans,filterConditions,inputPlanFilters, extraParamsNeeded, helpers) {
            let hasCollabChat = false, hasCollabCalls = false, filteredPlans = [];
            let canAddAdhocFilter = false;
            for (const plan of commPlans) {
                let filteredTasks = [];
                let isAdhoc = (plan.comm_plan_definition && !plan.comm_plan_definition.value);
                for (const task of plan.comm_tasks) {
                    if (task.comm_task_definition && !task.comm_task_definition.value)
                        task.adhoc = true;
                    if (task.channels.length > 0 && task.channels[0].channelType.value === 'conference') {
                        task.taskType = this.CONSTANTS.TASK_TYPE_COLLABORATION;
                        task.collabType = this.CONSTANTS.COLLABTYPE_CALL;
                        task.formattedStatus = await this.getFormattedStatus(task, helpers);
                        if (filterConditions && ((filterConditions.COLLABORATIONTASKS) || (filterConditions.COLLABORATIONTASKSCALL) || ((filterConditions.ADHOCTASKS || filterConditions.ADHOCCOLLABORATIONTASKS || filterConditions.ADHOCCOLLABORATIONTASKSCALL) && task.adhoc))) {
                            hasCollabCalls = true;
                            filteredTasks.push(task);
                        } 
                    } else if (task.channels.length > 0 && task.channels[0].is_collaboration_chat) {
                        task.taskType = this.CONSTANTS.TASK_TYPE_COLLABORATION;
                        task.collabType = this.CONSTANTS.COLLABTYPE_CHAT;
                        task.formattedStatus = await this.getFormattedStatus(task, helpers);
                        if (filterConditions && (filterConditions.COLLABORATIONTASKS || filterConditions.COLLABORATIONTASKSCHAT || ((filterConditions.ADHOCTASKS || filterConditions.ADHOCCOLLABORATIONTASKS || filterConditions.ADHOCCOLLABORATIONTASKSCHAT) && task.adhoc))
                        ) {
                            hasCollabChat = true;
                            filteredTasks.push(task);
                        } 
                    } else {
                        task.taskType = this.CONSTANTS.TASK_TYPE_COMMUNICATION;
                        task.formattedStatus = await this.getFormattedStatus(task, helpers);
                        if (filterConditions && (filterConditions.COMMUNICATIONTASKS)) {
                            filteredTasks.push(task);
                        } else if (filterConditions && ((filterConditions.ADHOCTASKS) || (filterConditions.ADHOCCOMMUNICATIONTASKS)) && task.adhoc) {
                            filteredTasks.push(task);
                        }
                    }
                }
                if (inputPlanFilters.length > 0) {
                    plan.comm_tasks = filteredTasks;
                    canAddAdhocFilter = (filteredTasks.length && extraParamsNeeded && isAdhoc) || canAddAdhocFilter;
                    if (filteredTasks.length && extraParamsNeeded && !isAdhoc) {
                        filteredPlans.push({
                            id: plan.sys_id.value,
                            label: plan.short_description.display_value
                        });
                    }
                }
            }
            if (canAddAdhocFilter) {
                filteredPlans.push({
                  id: "ad_hoc_communications",
                  label: await helpers.translate("Ad-hoc communications"),
                });
            }
            return {
                hasCollabChat: hasCollabChat,
                hasCollabCalls: hasCollabCalls,
                filteredPlans: filteredPlans,
                commPlans: commPlans
            };
        };

        /**
         * Filter input plan data
         * @param commPlans 
         * @param plan filters 
         * Iterate over each plan and filter out if does not match input commPlan id, in case of no input commPlan Ids, all plans are retained
         * Passes the data over to another filter function to apply filter conditions, and returns output data along with errors
         */
        static async filterPlanData(commPlans, commPlanIds, needsErrorMsg, extraParamsNeeded, filterConditions, inputPlanFilters, helpers) {
            let errorMessage = "";
            if (commPlanIds && commPlanIds.length) {
                let plans = [];
                let planIdsFound = [];
                commPlans.forEach((plan) => {
                    let commPlanSysId = plan.sys_id && plan.sys_id.value ? plan.sys_id.value : plan.commPlanSysId;
                    if (commPlanIds.indexOf(commPlanSysId) > -1) {
                        plans.push(plan);
                        if (needsErrorMsg) planIdsFound.push(commPlanSysId);
                    }
                });
                if (needsErrorMsg) {
                    let planIdsNotFound = commPlanIds.filter(
                        (x) => !(planIdsFound.indexOf(x) > -1)
                    );
                    if (planIdsNotFound.length > 0) {
                        let errorMessage = planIdsNotFound.join(",") + " plan id/ids not found";
                    }
                }
                return {
                    errorMessage: errorMessage,
                    commPlanData: await this.buildFilteredDataForCommAndCollab(plans, filterConditions, inputPlanFilters, extraParamsNeeded, helpers)
                };
            } else return {
                    errorMessage: errorMessage,
                    commPlanData: await this.buildFilteredDataForCommAndCollab(commPlans, filterConditions, inputPlanFilters, extraParamsNeeded, helpers)
            }
        };

         /**
         * Filter input plan data
         * @param commTasksByStatus
         * @param plan filters 
         * Iterate over each plan and filter out if does not match input commPlan id, in case of no input commPlan Ids, all plans are retained
         * Passes the data over to another filter function to apply filter conditions, and returns output data
         */
        static async filterStatusData(statusGroups, commPlanIds, extraParamsNeeded, filterConditions, inputPlanFilters, helpers) {
            if (commPlanIds && commPlanIds.length) {
                statusGroups.forEach((statusGroup) => {
                    let i = statusGroup.comm_tasks.length;
                    while (i--) {
                        let commTask = statusGroup.comm_tasks[i];
                        if (commPlanIds.indexOf(commTask.commPlanSysId) < 0) statusGroup.comm_tasks.splice(i, 1);
                    }
                });
            }
            return await this.buildFilteredDataForCommAndCollab(statusGroups, filterConditions, inputPlanFilters, extraParamsNeeded, helpers);
        };

        static getOutputType(dataResourceId) {
            switch (dataResourceId) {
                case 'get_task_communication_details':
                    return this.CONSTANTS.ICT_TASK_TYPE;
                case 'fetch_all_direct_collaboration_chats':
                    return this.CONSTANTS.DIRECT_CHAT_DATA_TYPE;
                case 'fetch_notify_conference_calls':
                    return this.CONSTANTS.DIRECT_CALL_DATA_TYPE;
            }
        }

        static emitRecordWatcherMessage(api, event, type, formatter){
            const payload = event.payload;
            const elementId = event.elementId;
            let formattedOutput = null;
            if (formatter && typeof formatter == "function"){
                formattedOutput =  formatter(payload);
            }
            api.emit(this.CONSTANTS.RECORD_WATCHER_MESSAGE, {
                id: elementId,
                type: type,
                raw: payload,
                formattedOutput: formattedOutput
            });
        }
    }
    return CommunicationDetailsTaskFilterUtilSNC;
}
