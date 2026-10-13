var CAOOBEventProcessor = Class.create();
CAOOBEventProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger("CAOOBEventProcessor");
        this.events = [];
        this.nonOverriddenEvents = this.getNonOverriddenOOBEvents();
    },

    getNonOverriddenOOBEvents: function() {
        var oobEvents = OOBEvents.getEvents();
        var rec = new GlideRecord('sn_ci_analytics_event');
        rec.addQuery();
        rec.query();
        while (rec.next()) {
            var eventType = rec.getValue('type');
            var isActive = Number(rec.getValue('active'));
            if (isActive && oobEvents[eventType]) {
                this.logger.info('"{0}" event overridden', eventType);
                delete oobEvents[eventType];
            }
        }
        return oobEvents;
    },

    process: function(payloadBuilder) {
        var conversation = payloadBuilder.getConversation();
        var conversationId = conversation.Id;
        var sharedData = payloadBuilder.getSharedData();
        var nonOverrides = this.nonOverriddenEvents;
        Object.keys(nonOverrides).forEach(function(key) {
            if (nonOverrides[key]) {
                var events = nonOverrides[key].getEvents(conversationId, sharedData) || [];
                events.forEach(function(event) {
                    payloadBuilder.getConversation()['Events'].push(event);
                });
            }
        });
    },

    type: 'CAOOBEventProcessor'
};

var OOBEvents = {
    getEvents: function() {
        return {
            'Bot Output': this.BOT_OUTPUT_EVENT,
            'User Input VA': this.USER_INPUT_EVENT,
            'Agent Zero Usage': this.ISSUE_AUTO_RESOLUTION_EVENT,
            'LA Escalation': this.SWITCH_LIVE_AGENT_MESSAGE_EVENT,
            'LA Message': this.LIVE_AGENT_MESSGE_EVENT,
            'User Input LA': this.USER_LIVE_AGENT_MESSAGE_EVENT,
            'Actionable Notification': this.ACTIONABLE_NOTIFICATION_EVENT,
            'Integration Hub': this.INTEGRATIONHUB_EVENT
        };
    },

    //DEF0179725 If actionable notification created before conversation set time to conversation creation time
    _getTime: function(creationTime, sharedData, params) {
        var time = creationTime - sharedData.conversation_startTime_mills;
        if (time < 0) {
            params.push(time);
            new CAOOBEventProcessor().logger.warn("Conversation Id: {0}, Negative time {2} has been found for {1} event", params);
            return 0;
        }

        return time;
    },

    BOT_OUTPUT_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'Bot Output';
            var rec = new GlideRecord('sys_cs_message');
            rec.addEncodedQuery('conversation=' + conversationId + "^direction=outbound^is_agent=false^message_type!=action^EQ");
            rec.query();
            while (rec.next()) {
                var errorMessage;
                var event = {
                    Properties: {}
                };
                var messageType = rec.message_type;
                var controlType;
                if (messageType == 'text')
                    controlType = messageType;
                else {
                    try {
                        var payload = JSON.parse(rec.payload);
                        controlType = payload.uiType;
                    } catch (err) {
                        // Fallback to text type processing
                        controlType = messageType;
                        errorMessage = "Processing failed for message: " + rec.sys_id + " " + err.message;
                        CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                    }
                }
                try {
                    event['Type'] = type;
                    event['Name'] = 'Bot Output';
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'Bot Output'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['Control Type'] = CAUtil.toString(controlType);
                    events.push(event);

                } catch (err) {
                    errorMessage = "Event processing failed. Event : BOT_OUTPUT_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        }
    },

    INTEGRATIONHUB_EVENT: {
        getEvents: function(conversationId, sharedData) {
            function filterInternalTopicBlock(rec) {
                var callingTaskTopicType = CAUtil.toString(rec.calling_cs_conversation_task.topic_type.type);
                var callingTaskParentTopicType = CAUtil.toString(rec.calling_cs_conversation_task.calling_task.topic_type.type);
                if (callingTaskTopicType == 'TOPIC_BLOCK' && callingTaskParentTopicType == 'SETUP_TOPIC')
                    return true;
                return false;
            }
            var events = [];
            var type = 'Integration Hub';
            var rec = new GlideRecord('sys_cs_fdih_invocation');
            rec.addEncodedQuery('calling_cs_conversation_task.conversation=' + conversationId);
            rec.query();
            while (rec.next()) {
                if (filterInternalTopicBlock(rec))
                    continue;
                try {
                    var gr = new GlideRecord(rec.api_source);
                    if (gr.get(rec.api)) {
                        var event = {
                            Properties: {}
                        };
                        event['Type'] = type;
                        var spoke = CAUtil.toString(gr.sys_scope.getDisplayValue());
                        event['Name'] = spoke;
                        var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                        var params = [conversationId, 'Integration Hub'];
                        event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                        var name = CAUtil.toString(gr.getValue('name'));
                        event['Properties']['Action'] = name;
                        event['Properties']['Spoke'] = spoke;
                        event['Properties']['Topic Name'] = CAUtil.toString(rec.calling_cs_conversation_task.topic_type.name);
                        event['Properties']['Type'] = CAUtil.toString(rec.type);
                        event['par_payload'] = new CAPARPayloadBuilder().getIntegrationHubPayload(rec, gr);
                        events.push(event);
                    }
                } catch (err) {
                    var errorMessage = "Event processing failed. Event : INTEGRATIONHUB_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    ACTIONABLE_NOTIFICATION_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'Actionable Notification';
            var rec = new GlideRecord('sys_cs_notification');
            rec.addEncodedQuery('conversation=' + conversationId);
            rec.query();
            while (rec.next()) {
                try {
                    var event = {
                        Properties: {}
                    };
                    event['Type'] = type;
                    event['Name'] = 'Actionable Notification';
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'Actionable Notification'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['State'] = CAUtil.toString(rec.state) == 'completed' ? 'Engaged' : 'Expired';
                    event['par_payload'] = new CAPARPayloadBuilder().getActionableNotificationPayload(event, rec);
                    events.push(event);

                } catch (err) {
                    var errorMessage = "Event processing failed. Event : ACTIONABLE_NOTIFICATION_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    SWITCH_LIVE_AGENT_MESSAGE_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'LA Escalation';
            var rec = new GlideRecord('sys_cs_conversation');
            rec.addEncodedQuery('sys_id=' + conversationId + "^live_agent_transfer_timeISNOTEMPTY^EQ");
            rec.query();
            while (rec.next()) {
                try {
                    var event = {
                        Properties: {}
                    };
                    event['Type'] = type;
                    event['Name'] = 'Switched To Live Agent';
                    var liveAgentTransferTime = new GlideDateTime(rec.getValue('live_agent_transfer_time')).getNumericValue();
                    var params = [conversationId, 'LA Escalation'];
                    event['Time'] = OOBEvents._getTime(liveAgentTransferTime, sharedData, params);
                    events.push(event);
                } catch (err) {
                    var errorMessage = "Event processing failed. Event : SWITCH_LIVE_AGENT_MESSAGE_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    USER_LIVE_AGENT_MESSAGE_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'User Input LA';
            var rec = new GlideRecord('sys_cs_message');
            rec.addEncodedQuery('conversation=' + conversationId + "^direction=outbound^message_type!=action^task.topic_type=ef989365c32013009cbbdccdf3d3ae53^EQ");
            rec.query();
            while (rec.next()) {
                try {
                    var controlType;
                    var selectedType;
                    var messageType = rec.message_type;
                    if (messageType == 'text') {
                        controlType = messageType;
                        selectedType = rec.payload;
                    } else {
                        var payload = JSON.parse(rec.payload);
                        controlType = payload.uiType;
                        if (controlType == "OutputLink")
                            selectedType = payload.uiMetadata.label;
                        else
                            selectedType = payload.value;
                    }

                    var event = {
                        Properties: {}
                    };
                    event['Type'] = type;
                    event['Name'] = 'User Live Agent Message';
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'User Input LA'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['Control Type'] = CAUtil.toString(controlType);
                    event['Properties']['Selected Value'] = CAUtil.toString(selectedType);
                    events.push(event);
                } catch (err) {
                    var errorMessage = "Event processing failed. Event : USER_LIVE_AGENT_MESSAGE_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    ISSUE_AUTO_RESOLUTION_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'Agent Zero Usage';
            var rec = new GlideRecord('sys_cs_auto_resolution_context');
            rec.addEncodedQuery('interaction.channel_metadata_document=' + conversationId);
            rec.query();
            while (rec.next()) {
                try {
                    var event = {
                        Properties: {}
                    };
                    event['Name'] = 'Issue Auto Resolution';
                    event['Type'] = type;
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'Agent Zero Usage'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['Acceptance Rate'] = CAUtil.toString(rec.notification_state);
                    event['Properties']['Topic End State'] = sharedData.conversation_end_state;
                    event['Properties']['Topic Name'] = CAUtil.toString(rec.matched_topic.name);
                    var usage = rec.task_resolved ? "Resolved" : "Unresolved";
                    event['Properties']['Usage'] = CAUtil.toString(usage);
                    event['par_payload'] = new CAPARPayloadBuilder().getIARPayload(event, rec);
                    events.push(event);
                } catch (err) {
                    var errorMessage = "Event processing failed. Event : ISSUE_AUTO_RESOLUTION_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    USER_INPUT_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'User Input VA';
            var rec = new GlideRecord('sys_cs_message');
            rec.addEncodedQuery('conversation=' + conversationId + "^direction=inbound^is_agent=false^message_type!=action^task.topic_type!=ef989365c32013009cbbdccdf3d3ae53^EQ");
            rec.query();
            while (rec.next()) {
                var errorMessage;
                var messageType = rec.message_type;
                var uiType, selectedType;
                if (messageType == 'text') {
                    uiType = messageType;
                    selectedType = rec.payload;
                } else {
                    try {
                        var payload = JSON.parse(rec.payload);
                        uiType = payload.uiType;
                        if (uiType == "TopicPickerControl" && !payload.searchText)
                            continue;

                        if (uiType == "TopicPickerControl") {
                            selectedType = payload.searchText;
                        } else {
                            selectedType = payload.value;
                        }
                    } catch (err) {
                        // Fallback to text type processing
                        uiType = messageType;
                        selectedType = rec.payload;
                        errorMessage = "Processing failed for message: " + rec.sys_id + " " + err.message;
                        CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                    }
                }
                try {
                    var event = {
                        Properties: {}
                    };
                    event['Type'] = type;
                    event['Name'] = 'User Input Event';
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'User Input VA'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['Control Type'] = CAUtil.toString(uiType);
                    event['Properties']['Selected Value'] = CAUtil.toString(selectedType);
                    events.push(event);

                } catch (err) {
                    errorMessage = "Event processing failed. Event : USER_INPUT_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },

    LIVE_AGENT_MESSGE_EVENT: {
        getEvents: function(conversationId, sharedData) {
            var events = [];
            var type = 'LA Message';
            var rec = new GlideRecord('sys_cs_message');
            rec.addEncodedQuery('conversation=' + conversationId + "^direction=outbound^is_agent=true^message_type!=action^EQ");
            rec.query();

            function controlType(rec) {
                var messageType = rec.message_type;
                if (messageType == 'text')
                    return messageType;
                var payload = JSON.parse(rec.payload);
                return payload.uiType;
            }
            while (rec.next()) {
                try {
                    var event = {
                        Properties: {}
                    };
                    event['Type'] = type;
                    event['Name'] = 'Live Agent Message';
                    var creationTime = new GlideDateTime(rec.getValue('sys_created_on')).getNumericValue();
                    var params = [conversationId, 'LA Message'];
                    event['Time'] = OOBEvents._getTime(creationTime, sharedData, params);
                    event['Properties']['Control Type'] = CAUtil.toString(controlType(rec));
                    events.push(event);

                } catch (err) {
                    var errorMessage = "Event processing failed. Event : LIVE_AGENT_MESSGE_EVENT, Conversation:  " + conversationId + " " + err.message;
                    CIAnalyticsLogger.getLogger("CAOOBEventProcessor").error(errorMessage);
                }
            }
            return events;
        },
    },
};
