function include({
    imports
}) {
    class PlayBookCommunicationCardUtilSNC {
        static CONSTANTS = {
            PAGE_HEADING_MAX_LENGTH: 50,
            OVERDUE: "Overdue",
            UPCOMING: "Upcoming",
            ONETIMETASK: "one_time",
            COLLABORATION: "collaboration",
            COLLABORATION_CALL: "call",
            COLLABORATION_CHAT: "chat",
            COMMUNICATION: "communication",
            ACTIVE: "Active",
            OPEN: "OPEN",
            SIDEBAR_DISCUSSION: "sidebar_discussion",
            MICROSOFT_TEAMS_CHAT: "microsoft_teams_chat",
            DIRECT_CHAT_SIDEBAR_DISCUSSION: "sidebar-discussion",
            DIRECT_CHAT_MICROSOFT_TEAMS_CHAT: "ms-teams-group-chat",
            RECURRING: "recurring",
            PENDING: "Pending",
            CONFERENCE_ICON: "conference-room-outline",
            INCIDENT_COMM_TASK_TABLE: "incident_alert_task",
            SLACK_CHAT: "slack-channel-chat",
            CONFERENCE: "Conference",
            SIDEBAR: "Sidebar discussion",
            MICROSOFT_TEAMS: "Microsoft Teams chat",
            INCIDENT_TABLE: "incident",
            COMM_PLAN_TABLE: "comm_plan",
            CHANNEL_TABLE: "comm_channel",
            COMM_TASK_TABLE: "comm_task"
        };
        static async getTranslatedMessages(helpers) {
            let translatedMessages = {};
            translatedMessages.collapseAll = await helpers.translate("Collapse all");
            translatedMessages.expandAll = await helpers.translate("Expand all");
            translatedMessages.communicationLabel = await helpers.translate("Communicate");
            translatedMessages.collaborateLabel = await helpers.translate("Collaborate");
            translatedMessages.adhocLabel = await helpers.translate("Ad-hoc communications and collaborations");
            translatedMessages.sidebarDiscussion = await helpers.translate("Sidebar discussion");
            translatedMessages.active = await helpers.translate("Active");
            translatedMessages.inProgress = await helpers.translate("In progress");
            translatedMessages.microsoftTeamsChat = await helpers.translate("Microsoft Teams chat");
            translatedMessages.conference = await helpers.translate("Conference");
            translatedMessages.chat = await helpers.translate("Chat");
            return translatedMessages;
        };
        static showControllerErrorMessagesAlerts(api, errors) {
            let alertsPayload = {
                items: []
            };
            for (let index in errors) {
                let payload = {
                    "id": "comm-details-filter-controller-error-msg" + index,
                    "action": {
                        "type": "dismiss"
                    },
                    "content": errors[index],
                    "status": "critical",
                    "icon": "info-circle-outline",
                };
                alertsPayload.items.push(payload);
            }
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', alertsPayload);
        };
        //template for ICT 
        static playBookCardICTObjectTemplate() {
            return {
                table: "",
                task_sys_id: "",
                state: "",
                due_date: "",
                short_description: "",
                description: "",
                sys_class_name: "",
                channels: [],
                collapseAll: false,
                commTaskType: "", // Defines overDue/upcoming/active
                commPlanId: "",
                communication_frequency: "",
                canClose: false,
                permissions: {},
                comm_count: 0,
                canStart: false,
                canSnooze: false,
                last_sent: "",
                taskType: "",
                status: "",
                last_sent_time_ago: "",
                commPlanDisplayName: "",
                ictNumber: "",
                commTaskTable: "",
                canSendUpdates: false
            };
        }
        //taskType : overdueTaks/upcomingTasks/activeTasks
        static async getFieldsForPlayBookCommCard(api, helpers, commTasks, activeCalls) {
            let updatedCommTasks = [];
            for (let i = 0; i < commTasks.length; i++) {
                let task = commTasks[i];
                let playBookCommTaskObj = this.playBookCardICTObjectTemplate();
                playBookCommTaskObj.table = api.context.props.table;
                playBookCommTaskObj.task_sys_id = task.sys_id.value;
                playBookCommTaskObj.state = task.state.display_value;
                playBookCommTaskObj.due_date = task.due_date.value;
                playBookCommTaskObj.short_description = task.short_description.value;
                playBookCommTaskObj.description = task.description.value;
                playBookCommTaskObj.commPlanDisplayName = task.commPlanDisplayName;
                playBookCommTaskObj.channels = task.channels;
                playBookCommTaskObj.collapseAll = false;
                playBookCommTaskObj.commTaskType = task.statusGroup; // Defines overDue/upcoming/active 
                playBookCommTaskObj.commPlanId = task.commPlanSysId;
                playBookCommTaskObj.communication_frequency = task.communication_frequency.value;
                playBookCommTaskObj.last_sent_time_ago = task.last_communication.time_ago;
                playBookCommTaskObj.canClose = task.canClose;
                playBookCommTaskObj.permissions = task.permissions;
                playBookCommTaskObj.comm_count = parseInt(task.comm_count.value);
                playBookCommTaskObj.canStart = task.canStart;
                playBookCommTaskObj.canSnooze = task.canSnooze;
                playBookCommTaskObj.last_sent = task.last_communication.display_value_internal;
                playBookCommTaskObj.taskType = task.taskType;
                playBookCommTaskObj.ictNumber = task.number.value;
                playBookCommTaskObj.commTaskTable = task.sys_class_name.value;
                playBookCommTaskObj.canSendUpdates = task.canSendUpdates;
                if (task.taskType.toUpperCase() === this.CONSTANTS.COMMUNICATION.toUpperCase()) {
                    if (task.comm_count.value > 0 && task.communication_frequency.value === this.CONSTANTS.ONETIMETASK)
                        playBookCommTaskObj.status = await helpers.translate("Sent");
                    else if (task.comm_count.value > 0)
                        playBookCommTaskObj.status = await helpers.translate("Sent ({0}x)", [task.comm_count.value]);
                    else
                        playBookCommTaskObj.status = await helpers.translate("Not sent");
                } else if (task.taskType.toUpperCase() === this.CONSTANTS.COLLABORATION.toUpperCase() && task.statusGroup.toUpperCase() != this.CONSTANTS.ACTIVE.toUpperCase()) {
                    if (task.comm_count.value > 0 && task.communication_frequency.value === this.CONSTANTS.ONETIMETASK)
                        playBookCommTaskObj.status = await helpers.translate("Started");
                    else if (task.comm_count.value > 0)
                        playBookCommTaskObj.status = await helpers.translate("Started ({0}x)", [task.comm_count.value]);
                    else
                        playBookCommTaskObj.status = await helpers.translate("Not started");
                } else if (task.taskType.toUpperCase() === this.CONSTANTS.COLLABORATION.toUpperCase() && task.statusGroup.toUpperCase() === this.CONSTANTS.ACTIVE.toUpperCase()) {
                    if ((task.comm_count.value > 0 && task.communication_frequency.value === this.CONSTANTS.ONETIMETASK) || (task.communication_frequency.value === this.CONSTANTS.ONETIMETASK && task.collabType.toUpperCase() === this.CONSTANTS.COLLABORATION_CHAT.toUpperCase()))
                        playBookCommTaskObj.status = await helpers.translate("Active");
                    else if (task.comm_count.value > 0)
                        playBookCommTaskObj.status = await helpers.translate("Active ({0}x)", [task.comm_count.value]);

                }
                if (task.collabType) playBookCommTaskObj.collabType = task.collabType;
                if (task.taskType == this.CONSTANTS.COLLABORATION && task.collabType == this.CONSTANTS.COLLABORATION_CHAT && task.channels &&
                    task.channels.length > 0) {
                    if (task.channels[0].channelType && task.channels[0].channelType.value == this.CONSTANTS.DIRECT_CHAT_SIDEBAR_DISCUSSION) {
                        playBookCommTaskObj.canInitiateSidebarDiscussion = task.canInitiateSidebarDiscussion;
                        playBookCommTaskObj.serviceProvider = await helpers.translate("Chat");
                        playBookCommTaskObj.icon = "ongoing-outline";
                    } else {
                        let channel = (task.channels[0].channelType) ? task.channels[0].channelType.display_value : await helpers.translate("Chat");
                        let channelType = (task.channels[0].channelType) ? task.channels[0].channelType.value : "chat";
                        playBookCommTaskObj.serviceProvider = (channelType == this.CONSTANTS.DIRECT_CHAT_MICROSOFT_TEAMS_CHAT) ? await helpers.translate("Microsoft Teams chat") : channel;
                        playBookCommTaskObj.icon = (task.channels[0].channelType) ? this.serviceProviderIcon(task.channels[0].channelType.value) : "ongoing-outline";
                    }
                }
                if (task.taskType == this.CONSTANTS.COLLABORATION && task.collabType == this.CONSTANTS.COLLABORATION_CALL && task.channels &&
                    task.channels.length > 0 && task.channels[0].notify_conference_call) {
                    let notifycallSysId = task.channels[0].notify_conference_call.value;
                    if (task.statusGroup.toUpperCase() === this.CONSTANTS.ACTIVE.toUpperCase()) {
                        playBookCommTaskObj.organizerName = this.getOrganizerNameForActiveCollabTask(activeCalls[notifycallSysId].participants);
                        playBookCommTaskObj.serviceProvider = (activeCalls[notifycallSysId].service_provider) ? activeCalls[notifycallSysId].service_provider.display_value : await helpers.translate("Conference");
                        playBookCommTaskObj.icon = this.serviceProviderIcon(playBookCommTaskObj.serviceProvider);
                        if (playBookCommTaskObj.serviceProvider === "Telephony") {
                            playBookCommTaskObj.serviceProvider = (activeCalls[notifycallSysId].number_owner) ? activeCalls[notifycallSysId].number_owner.display_value : await helpers.translate("Twilio Direct");
                        }
                    } else {
                        playBookCommTaskObj.serviceProvider = await helpers.translate("Conference");
                        playBookCommTaskObj.icon = "conference-room-outline";
                    }
                    playBookCommTaskObj.activeCallTime = (activeCalls[notifycallSysId]) ? activeCalls[notifycallSysId].sys_created_on.value : this.CONSTANTS.CONFERENCE;
                }
                if (task.statusGroup.toUpperCase() === this.CONSTANTS.ACTIVE.toUpperCase())
                    playBookCommTaskObj.createdOn = task.sys_created_on.value;
                updatedCommTasks.push(playBookCommTaskObj);
            };
            return updatedCommTasks;
        }
        static getOrganizerNameForActiveCollabTask(participants) {
            for (let participant of Object.keys(participants)) {
                participant = participants[participant];
                if (participant.initiator && participant.initiator.value == "true") {
                    return participant.user.display_value;
                }
            }
        }
        // Build playbookcard object for directcall / directChat
        static playBookCardObjectTemplate() {
            return {
                short_description: "",
                status: "",
                state: "",
                organizerName: "",
                channels: [],
                taskType: this.CONSTANTS.COLLABORATION
            };
        }

        static serviceProviderIcon(serviceProvider) {
            let icons = {
                "Zoom": "zoom-outline",
                "Microsoft Teams chat": "microsoft-teams-outline",
                "Cisco Webex": "user-group-outline",
                "Telephony": "twilio-outline",
                "Slack chat": "slack-outline",
                "Sidebar discussion": "ongoing-outline",
                "Conference": "conference-room-outline",
                "Chat": "ongoing-outline",
                "slack-channel-chat": "slack-outline",
                "ms-teams-group-chat": "microsoft-teams-outline"
            };
            return icons[serviceProvider];
        }
        static buildPlaybookcardObjectForDirectChat(commTasksArray, translatedMessages) {
            let processedCommTasks = [];
            for (let i = 0; i < commTasksArray.length; i++) {
                if ((commTasksArray[i].active && commTasksArray[i].active.toUpperCase() == this.CONSTANTS.ACTIVE.toUpperCase()) ||
                    (commTasksArray[i].state && commTasksArray[i].state.toUpperCase() == this.CONSTANTS.OPEN) || commTasksArray[i].active == 1) {
                    let playBookCardObject = this.playBookCardObjectTemplate();
                    playBookCardObject.isDirectChat = true;
                    playBookCardObject.short_description = commTasksArray[i].title;
                    playBookCardObject.createdOn = commTasksArray[i].startedOn;
                    playBookCardObject.activeCallTime = commTasksArray[i].startedOn;
                    playBookCardObject.collabType = this.CONSTANTS.COLLABORATION_CHAT;
                    playBookCardObject.commTaskType = 'ACTIVE';
                    if (commTasksArray[i].type == this.CONSTANTS.SIDEBAR_DISCUSSION) {
                        playBookCardObject.chatSysId = commTasksArray[i].chatSysId;
                        playBookCardObject.serviceProvider = translatedMessages.chat;
                        playBookCardObject.icon = this.serviceProviderIcon(this.CONSTANTS.SIDEBAR);
                        playBookCardObject.channelType = this.CONSTANTS.DIRECT_CHAT_SIDEBAR_DISCUSSION;
                        for (let j = 0; j < commTasksArray[i].participants.length; j++) {
                            if (commTasksArray[i].participants[j].sysId == commTasksArray[i].createdBy) {
                                playBookCardObject.organizerName = commTasksArray[i].participants[j].userName;
                                break;
                            }
                        }
                        if (commTasksArray[i].state.toUpperCase() == this.CONSTANTS.OPEN) {
                            playBookCardObject.status = translatedMessages.active;
                            playBookCardObject.state = translatedMessages.inProgress;
                        }
                    } else if (commTasksArray[i].type == this.CONSTANTS.MICROSOFT_TEAMS_CHAT) {
                        playBookCardObject.serviceProvider = translatedMessages.microsoftTeamsChat;
                        playBookCardObject.icon = this.serviceProviderIcon(this.CONSTANTS.MICROSOFT_TEAMS);
                        playBookCardObject.channelType = this.CONSTANTS.DIRECT_CHAT_MICROSOFT_TEAMS_CHAT;
                        playBookCardObject.organizerName = commTasksArray[i].createdByName;
                        if (commTasksArray[i].active == 1) {
                            playBookCardObject.status = translatedMessages.active;
                            playBookCardObject.state = translatedMessages.inProgress;
                        }
                    }
                    let channel = {
                        "comm_channel_config": {
                            "display_value": playBookCardObject.serviceProvider,
                        },
                        "channelType": {
                            "value": playBookCardObject.channelType
                        }
                    };
                    playBookCardObject.channels.push(channel);
                    processedCommTasks.push(playBookCardObject);
                }
            }
            return processedCommTasks;
        };
        static buildPlaybookcardObjectForDirectCall(api, commTasksArray, translatedMessages, NowDateTime) {
            const timeZone = api.context.session.user.timeZone;
            let processedCommTasks = [];
            for (let i = 0; i < commTasksArray.length; i++) {
                let callStatus = commTasksArray[i].callStatus;
                if (callStatus.indexOf("Active") == -1) continue;
                if (!commTasksArray[i].callRecords) continue;
                for (let j = 0; j < commTasksArray[i].callRecords.length; j++) {
                    if (commTasksArray[i].callRecords[j].active) {
                        let playBookCardObject = this.playBookCardObjectTemplate();
                        playBookCardObject.short_description = commTasksArray[i].callRecords[j].title.original;
                        playBookCardObject.sysId = commTasksArray[i].callRecords[j].callID;
                        playBookCardObject.isDirectCall = true;
                        playBookCardObject.commTaskType = 'ACTIVE';
                        playBookCardObject.status = translatedMessages.active;
                        playBookCardObject.state = translatedMessages.inProgress;
                        playBookCardObject.organizerName = commTasksArray[i].callRecords[j].organiser.displayName;
                        playBookCardObject.createdOn = this.getNowDateTime(NowDateTime, commTasksArray[i].callRecords[j].startTime, null, timeZone, "UTC").format("YYYY-MM-DD HH:mm:ss");
                        playBookCardObject.activeCallTime = new Date(commTasksArray[i].callRecords[j].startTimeEpoch).toISOString().replace("T", " ").replace(".000Z", "");
                        playBookCardObject.collabType = this.CONSTANTS.COLLABORATION_CALL;
                        playBookCardObject.icon = (commTasksArray[i].callRecords[j].sp) ? commTasksArray[i].callRecords[j].sp.icon : this.CONSTANTS.CONFERENCE_ICON;
                        playBookCardObject.serviceProvider = (commTasksArray[i].callRecords[j].sp) ? commTasksArray[i].callRecords[j].sp.displayName : translatedMessages.conference;
                        let channel = {
                            "comm_channel_config": {
                                "display_value": playBookCardObject.serviceProvider
                            }
                        };
                        playBookCardObject.channels.push(channel);
                        processedCommTasks.push(playBookCardObject);
                    }
                }
            }
            return processedCommTasks;
        };
        static sortAdhocActiveTasks(activeTasks) {
            let sortAdhocActiveTasks = activeTasks.sort(function(commTask1, commTask2) {
                return new Date(commTask2.createdOn) - new Date(commTask1.createdOn);
            });
            return sortAdhocActiveTasks;
        };
        static async overFlowMenuOptionsForCollabCards(helpers, commTaskDetails) {
            let overFlowActions = [];
            if (commTaskDetails.state && commTaskDetails.state.toUpperCase() === this.CONSTANTS.PENDING.toUpperCase() && commTaskDetails.canStart) {
                overFlowActions.push({
                    "id": "start",
                    "label": await helpers.translate("Start task")
                });
                overFlowActions.push({
                    "id": "viewRecord",
                    "label": await helpers.translate("View record")
                });
                return overFlowActions;
            }
            if (commTaskDetails.commTaskType && commTaskDetails.commTaskType.toUpperCase() == this.CONSTANTS.ACTIVE.toUpperCase()) {
                overFlowActions.push({
                    "id": "viewRecord",
                    "label": await helpers.translate("View record")
                });
                if (commTaskDetails.collabType == this.CONSTANTS.COLLABORATION_CALL && commTaskDetails.canClose)
                    overFlowActions.push({
                        "id": "close",
                        "label": await helpers.translate("Close")
                    });
                return overFlowActions;
            }
            if (commTaskDetails.commTaskType && (commTaskDetails.commTaskType.toUpperCase() === this.CONSTANTS.OVERDUE.toUpperCase() ||
                    commTaskDetails.commTaskType.toUpperCase() === this.CONSTANTS.UPCOMING.toUpperCase())) {
                if (commTaskDetails.communication_frequency && commTaskDetails.communication_frequency.toUpperCase() == this.CONSTANTS.RECURRING.toUpperCase() && commTaskDetails.canSnooze)
                    overFlowActions.push({
                        "id": "snooze",
                        "label": await helpers.translate("Snooze")
                    });
                if (commTaskDetails.permissions && commTaskDetails.permissions.manage_recipients)
                    overFlowActions.push({
                        "id": "manageParticipants",
                        "label": await helpers.translate("Manage participants")
                    });
                overFlowActions.push({
                    "id": "viewRecord",
                    "label": await helpers.translate("View record")
                });
                if (commTaskDetails.canClose)
                    overFlowActions.push({
                        "id": "close",
                        "label": await helpers.translate("Close")
                    });
                return overFlowActions;
            }

        };
        static async overFlowMenuOptionsForCommunicationCards(helpers, commTaskDetails) {
            let overFlowActions = [];
            if (commTaskDetails.state && commTaskDetails.state.toUpperCase() === this.CONSTANTS.PENDING.toUpperCase() && commTaskDetails.canStart) {
                overFlowActions.push({
                    "id": "start",
                    "label": await helpers.translate("Start task")
                });
                overFlowActions.push({
                    "id": "viewRecord",
                    "label": await helpers.translate("View record")
                });
                return overFlowActions;
            }
            if (commTaskDetails.communication_frequency && commTaskDetails.communication_frequency.toUpperCase() == this.CONSTANTS.RECURRING.toUpperCase() && commTaskDetails.canSnooze)
                overFlowActions.push({
                    "id": "snooze",
                    "label": await helpers.translate("Snooze")
                });
            if (commTaskDetails.permissions && commTaskDetails.permissions.manage_recipients)
                overFlowActions.push({
                    "id": "manageRecipients",
                    "label": await helpers.translate("Manage recipients")
                });
            overFlowActions.push({
                "id": "viewRecord",
                "label": await helpers.translate("View record")
            });
            if (commTaskDetails.canClose)
                overFlowActions.push({
                    "id": "close",
                    "label": await helpers.translate("Close")
                });
            return overFlowActions;
        };
        static async convertDurationIntoTime(helpers, duration) {
            if (duration < 1000)
                duration = 0;
            let seconds = Math.floor((duration / 1000) % 60),
                minutes = Math.floor((duration / (1000 * 60)) % 60),
                hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
                days = Math.floor((duration / (1000 * 60 * 60)) / 24);
            let ago = await helpers.translate("ago");
            let lastSent = "";
            if (days || hours || minutes) {
                let nDays = days == 1 ? await helpers.translate("1 day") : await helpers.translate("{0} days", [days]);
                let nHours = hours == 1 ? await helpers.translate("1 hour") : await helpers.translate("{0} hours", [hours]);
                let nMintues = minutes == 1 ? await helpers.translate("1 minute") : await helpers.translate("{0} minutes", [minutes]);
                if (days)
                    return nDays + " " + nHours + " " + nMintues + " " + ago;
                else if (hours)
                    return nHours + " " + nMintues + " " + ago;
                else
                    return nMintues + " " + ago;
            } else
                return seconds == 1 ? await helpers.translate("1 second ago") : await helpers.translate("{0} seconds ago", [seconds]);
        };
        static getNowDateTime(
            NowDateTime,
            dateTime,
            dateTimeFormat,
            sourceTimezone,
            convertToTimezone
        ) {
            if (!dateTime)
                return NowDateTime();
            let nowDateTime = dateTimeFormat ?
                NowDateTime(dateTime, _parseFormat(dateTimeFormat)) :
                NowDateTime(dateTime);
            if (sourceTimezone)
                nowDateTime = nowDateTime.tz(sourceTimezone, true);
            return convertToTimezone ? nowDateTime.tz(convertToTimezone) : nowDateTime;
        };
    };
    return PlayBookCommunicationCardUtilSNC;
}
