var CAPARProcessor = Class.create();
CAPARProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger({
            source: 'CAPARProcessor',
        });
        this.config = new CAConfig();
        this.jobMaxConversationCount = this.config.getJobMaxConversationCount();
        this.addPropertyOperationHandler = {
            'Topic Category': this._addTopicCategoryPropeties,
            'Topic': this._addTopicProperties,
            'Integration Hub': this._addIntegrationHubProperties
        };
        this.channels = this._getChannels();
        this.eventTypes = this._getEventTypes();
    },

    process: function() {
        var caConversationGr = this._queryCAConversation();
        if (this.config.isParJobEnabled() != 'true') {
            caConversationGr.setValue('par_status', 'ignored');
            caConversationGr.updateMultiple();
            return;
        }
        while (caConversationGr.next()) {
            this.processConversation(caConversationGr);
        }
    },

    processConversation: function(caConversationGr) {
        try {
            if (caConversationGr.status == 'processed' && gs.nil(caConversationGr.conversation_payload)) {
                var reason = "[PAR Job]: Conversation ignored due to empty conversation payload";
                caConversationGr.setValue('reason', this._getReason(caConversationGr, reason));
                caConversationGr.setValue('par_status', 'ignored');
                caConversationGr.update();
                return;
            }
            var csDetails = new GlideRecord('sn_ci_analytics_cs_details');
            csDetails.addQuery('conversation', caConversationGr.getValue('conversation'));
            csDetails.query();
            if (!csDetails.hasNext()) {
                this.conversation = this._buildConversationObj(caConversationGr.getValue('conversation'));
                this.payload = JSON.parse(caConversationGr.getValue('conversation_payload'));
                var userId = this._insertUpdateUser();
                var stgConversationId = this._insertConversation(userId);
                var self = this;
                if (Array.isArray(this.payload[CAPARConstants.EVENTS])) {
                    this.payload[CAPARConstants.EVENTS].forEach(function(event) {
                        try {
                            if (event.Type === CAPARConstants.EVENT_TYPE_CUSTOM) {
                                self._insertCustomEventBreakdown(event);
                            }
                            var eventTypeId = self.eventTypes[event[CAPARConstants.EVENT_TYPE]];
                            if (!gs.nil(CAConstants.searchEventsIds[event.Name])) {
                                var breakdownId = self._insertSearchMetricCustomBreakdown(event);
                                eventTypeId = CAConstants.searchEventsIds[event.Name];
                                event[CAPARConstants.PAR_PAYLOAD] = breakdownId ? {
                                    breakdown_id: breakdownId,
                                    event_type_id: eventTypeId,
                                    created_on: event[CAPARConstants.PAR_PAYLOAD].created_on,
                                } : event[CAPARConstants.PAR_PAYLOAD];
                            }
                            if (event[CAPARConstants.PAR_PAYLOAD]) {
                                self._addProperties(event);
                                var attributes = JSON.stringify(self._getEventAttributes(event));
                                self._insertConversationEvent(caConversationGr.getUniqueValue(), event[CAPARConstants.PAR_PAYLOAD], eventTypeId, attributes);
                            }

                        } catch (err) {
                            this.logger.error('[PAR Job]: An exception occurred while processing the conversation event: {0}, \nerror: {1} \n{2}', [JSON.stringify(event), err.message, err.stack]);
                        }
                    });
                }
            }
            caConversationGr.setValue('par_status', 'processed');
        } catch (err) {
            this.logger.error('[PAR Job]: An exception occurred while processing the conversation: {0}, \nerror: {1} \n{2}', [caConversationGr.getValue('conversation'), err.message, err.stack]);
            var message = '[PAR Job]: An exception occurred while processing the conversation: ' + caConversationGr.getValue('conversation');
            var reason = caConversationGr.getValue('reason');
            reason = gs.nil(reason) ? message : reason + '\n' + message;
            caConversationGr.setValue('par_status', 'error');
            caConversationGr.setValue('reason', reason);
        }
        caConversationGr.update();
    },

    _getEventAttributes: function(event) {
        var attributes = {};
        if (gs.nil(event))
            return attributes;
        if (event.Type === CAPARConstants.EVENT_TYPE_TOPIC)
            attributes.type = event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_SUB_CATEGORY];
        return attributes;
    },

    _insertCustomEventBreakdown: function(event) {
        if (gs.nil(event) || gs.nil(event[CAPARConstants.PAR_PAYLOAD]))
            return false;
        var parInfo = event[CAPARConstants.PAR_PAYLOAD];
        if (gs.nil(parInfo.event_id))
            return false;
        var eventId = parInfo.event_id;
        var eventProps = gs.nil(parInfo.event_props) ? [] : parInfo.event_props;
        eventProps.forEach(function(eventProp) {
            var breakdownValue = eventProp['prop_value'];
            var eventPropId = eventProp['prop_id'];
            if (gs.nil(breakdownValue) || gs.nil(eventPropId) || gs.nil(eventId)) {
                return;
            };
            var gr = new GlideRecord('sn_ci_analytics_event_breakdown');
            gr.addQuery('breakdown_value', breakdownValue);
            gr.addQuery('event', eventId);
            gr.addQuery('event_prop', eventPropId);
            gr.query();
            if (gr.next()) {
                gr.setValue('sys_updated_on', new GlideDateTime());
                eventProp['breakdown_id'] = gr.update();
            } else {
                gr.initialize();
                gr.breakdown_value = breakdownValue;
                gr.event = eventId;
                gr.event_prop = eventPropId;
                eventProp['breakdown_id'] = gr.insert();
            }
        });
    },

    _getBreakdownValue: function(event) {
        var eventName = event.Name;
        if (eventName == CAConstants.eventNames.AI_SEARCH_RESULT_CLICKED) {
            return event.Properties['Title'];
        } else if (eventName == CAConstants.eventNames.CONTEXTUAL_SEARCH_RESULT_CLICKED) {
            return event.Properties['Title'];
        } else if (eventName == CAConstants.eventNames.BOT_OUTPUT_LINK_CLICKED) {
            return event.Properties["URL"];
        }
        return event.Properties['Search Term'];
    },

    _insertSearchMetricCustomBreakdown: function(event) {
        if (gs.nil(event) || gs.nil(event.Properties))
            return false;
        var breakdownValue = this._getBreakdownValue(event);
        var eventTypeId = CAConstants.searchEventsIds[event.Name];
        if (gs.nil(breakdownValue) || gs.nil(eventTypeId))
            return false;
        var gr = new GlideRecord('sn_ci_analytics_search_breakdown');
        gr.addQuery('breakdown_value', breakdownValue);
        gr.addQuery('event_type', eventTypeId);
        gr.addQuery('sys_domain', this.conversation['domain']);
        gr.query();
        if (gr.next()) {
            gr.setValue('sys_updated_on', new GlideDateTime());
            return gr.update();
        }
        gr.initialize();
        gr.breakdown_value = breakdownValue;
        gr.event_type = eventTypeId;
        gr.sys_domain = this.conversation['domain'];
        return gr.insert();
    },

    _queryCAConversation: function() {
        var caConversationGr = new GlideRecord('sn_ci_analytics_conversation');
        caConversationGr.addQuery('status', 'processed');
        caConversationGr.addQuery('par_status', 'new');
        caConversationGr.addNotNullQuery('conversation_payload');
        caConversationGr.orderBy('consumer');
        caConversationGr.orderBy('sys_created_on');
        if (this.jobMaxConversationCount > 0)
            caConversationGr.setLimit(this.jobMaxConversationCount);
        caConversationGr.query();
        return caConversationGr;
    },

    _buildConversationObj: function(conversationId) {
        if (gs.nil(conversationId))
            return;
        var conversation = {
            'id': conversationId
        };
        var conversationGr = new GlideRecord('sys_cs_conversation');
        if (conversationGr.get(conversationId)) {
            conversation['start_time'] = conversationGr.getValue('sys_created_on');
            conversation['consumer'] = conversationGr.getValue('consumer');
            conversation['domain'] = conversationGr.getValue('sys_domain');
        }
        return conversation;
    },

    _insertUpdateUser: function() {
        if (gs.nil(this.conversation['consumer']))
            return;
        var channel = this.channels[this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_CHANNEL_NAME]];
        if (gs.nil(channel))
            channel = this._getChannelId(this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_CHANNEL_NAME]);
        var userDomain = this.conversation['domain'];
        var stgUser = new GlideRecord('sn_ci_analytics_user');
        stgUser.addQuery('user', this.conversation['consumer']);
        stgUser.addQuery('sys_domain', userDomain);
        stgUser.query();
        if (stgUser.next()) {
            var userChannels = stgUser.getValue('channels');
            var channels = userChannels ? userChannels.split(',') : [];
            if (channels.indexOf(channel) == -1)
                channels.push(channel);
            stgUser.setValue('channels', channels.toString());
            stgUser.setValue('last_conversation', this.conversation['start_time']);
            return stgUser.update();
        } else {
            stgUser.setValue('is_anonymous', this.payload[CAPARConstants.USER] && !gs.nil(this.payload[CAPARConstants.USER][CAPARConstants.USER_Id]) ? false : true);
            stgUser.setValue('user', this.conversation['consumer']);
            stgUser.setValue('last_conversation', this.conversation['start_time']);
            stgUser.setValue('channels', channel);
            stgUser.setValue('sys_domain', userDomain);
            return stgUser.insert();
        }
    },



    _insertConversation: function(userId) {
        var stgConversation = new GlideRecord('sn_ci_analytics_cs_details');
        stgConversation.initialize();
        var channel, selfSolve, endState, feedbackResult, type, language, topicIds = [],
            topicCategoryIds = [];
        if (!gs.nil(this.payload[CAPARConstants.DYNAMICPROPERTIES])) {
            channel = this.channels[this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_CHANNEL_NAME]];
            if (gs.nil(channel))
                channel = this._getChannelId(this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_CHANNEL_NAME]);
            selfSolve = this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_SELF_SOLVE];
            endState = CAPARConstants.CONVERSATION_END_STATES[this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_END_STATE]] || '';
            feedbackResult = this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_FEEDBACK_RESULT_ID];
            type = this.payload[CAPARConstants.DYNAMICPROPERTIES][CAPARConstants.DP_CONVERSATION_TYPE] || '';
        }
        if (!gs.nil(this.payload[CAPARConstants.EVENTS]) && Array.isArray(this.payload[CAPARConstants.EVENTS])) {
            topicIds = this.payload[CAPARConstants.EVENTS].filter(function(event) {
                return event[CAPARConstants.EVENT_TYPE] == CAPARConstants.EVENT_TYPE_TOPIC;
            }).map(function(event) {
                return event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_TOPIC_ID];
            });
            topicCategoryIds = this.payload[CAPARConstants.EVENTS].filter(function(event) {
                return event[CAPARConstants.EVENT_TYPE] == CAPARConstants.EVENT_TYPE_TOPIC_CATEGORY;
            }).map(function(event) {
                return event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_TOPIC_CATEGORY_ID];
            });
        }
        if (!gs.nil(this.payload[CAPARConstants.LOCALE])) {
            var languageGr = this._getLanguage(this.payload[CAPARConstants.LOCALE]);
            if (languageGr && languageGr.next())
                language = languageGr.getUniqueValue();
        }
        var fieldValueMapper = {
            'conversation': this.payload[CAPARConstants.ID],
            'channel': channel,
            'duration': new GlideDuration(this.payload[CAPARConstants.DURATION]) || 0,
            'user': userId,
            'self_solve': selfSolve,
            'end_state': endState,
            'feedback_result': feedbackResult,
            'type': type,
            'topics': topicIds.toString(),
            'topic_categories': topicCategoryIds.toString(),
            'language': language,
            'created_on': this.conversation['start_time'],
            'sys_domain': this.conversation['domain']
        };
        for (var field in fieldValueMapper) {
            stgConversation.setValue(field, fieldValueMapper[field]);
        }
        return stgConversation.insert();
    },

    _insertConversationEvent: function(coversationId, event, eventTypeId, attributes) {
        if (gs.nil(coversationId) || gs.nil(event))
            return;
        try {
            var stgConversationEvent = new GlideRecord('sn_ci_analytics_st_cs_event');
            stgConversationEvent.initialize();
            stgConversationEvent.setValue('conversation', coversationId);
            stgConversationEvent.setValue('event_payload', JSON.stringify(event));
            stgConversationEvent.setValue('created_on', event.created_on);
            stgConversationEvent.setValue('attributes', attributes);
            stgConversationEvent.setValue('sys_domain', this.conversation['domain']);
            if (!gs.nil(eventTypeId))
                stgConversationEvent.setValue('event_type', eventTypeId);
            return stgConversationEvent.insert();
        } catch (err) {
            this.logger.error('PAR Job Error: An exception occurred while inserting the event for the conversation: {0}, event: {1}, \nerror: {2} \n{3}', [this.conversation['id'], JSON.stringify(event), err.message, err.stack]);
        }
    },

    _getCustomBreakdown: function(event, breakdownName, breakdownValue) {
        if (gs.nil(breakdownName) || gs.nil(breakdownValue))
            return;
        var customBreakdownGr = new GlideRecord('sn_ci_analytics_custom_breakdown');
        customBreakdownGr.addQuery('event_type', event);
        customBreakdownGr.addQuery('breakdown_name', breakdownName);
        customBreakdownGr.addQuery('breakdown_value', breakdownValue);
        customBreakdownGr.query();
        if (customBreakdownGr.next())
            return customBreakdownGr.getUniqueValue();
    },

    _insertCustomBreakdown: function(event, breakdownName, breakdownValue) {
        if (gs.nil(breakdownName) || gs.nil(breakdownValue))
            return;
        var customBreakdownGr = new GlideRecord('sn_ci_analytics_custom_breakdown');
        customBreakdownGr.initialize();
        customBreakdownGr.setValue('event_type', event);
        customBreakdownGr.setValue('breakdown_name', breakdownName);
        customBreakdownGr.setValue('breakdown_value', breakdownValue);
        return customBreakdownGr.insert();
    },

    _getPropertyValue: function(type, breakdownName, breakdownValue) {
        if (gs.nil(breakdownName) || gs.nil(breakdownValue))
            return;
        var eventTypeId = '';
        if (!gs.nil(type))
            eventTypeId = this.eventTypes[type];
        var value = this._getCustomBreakdown(eventTypeId, breakdownName, breakdownValue);
        if (gs.nil(value))
            value = this._insertCustomBreakdown(eventTypeId, breakdownName, breakdownValue);
        return value;
    },

    _addProperties: function(event) {
        if (gs.nil(event))
            return;
        var handler = this.addPropertyOperationHandler[event[CAPARConstants.EVENT_TYPE]];
        if (handler)
            handler.call(this, event);
    },

    _addTopicCategoryPropeties: function(event) {
        if (gs.nil(event))
            return;
        event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_CHANNEL] = this.channels[event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_CHANNEL_NAME]];
        if (gs.nil(event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_CHANNEL]))
            event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_CHANNEL] = this._getChannelId(event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_CHANNEL_NAME]);
    },

    _addTopicProperties: function(event) {
        if (gs.nil(event))
            return;
        event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_LAST_VISITED_NODE] = this._getPropertyValue(event[CAPARConstants.EVENT_TYPE], CAPARConstants.BREAKDOWN.NAME.LAST_VISITED_NODE, event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_LAST_VISITED_NODE_NAME]);
        event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_TOPIC_TYPE] = this._getPropertyValue(event[CAPARConstants.EVENT_TYPE], CAPARConstants.BREAKDOWN.NAME.TYPE, event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_SUB_CATEGORY]);
    },

    _addIntegrationHubProperties: function(event) {
        if (gs.nil(event))
            return;
        event[CAPARConstants.PAR_PAYLOAD][CAPARConstants.PAR_PAYLOAD_SPOKE] = this._getPropertyValue(event[CAPARConstants.EVENT_TYPE], CAPARConstants.BREAKDOWN.NAME.SPOKE, event[CAPARConstants.EVENT_PROPERTIES][CAPARConstants.EVENT_PROP_SPOKE]);
    },

    _getEventTypes: function() {
        var eventTypes = {};
        var conversationEventTypeGr = new GlideRecord('sn_ci_analytics_cs_event_type');
        conversationEventTypeGr.query();
        while (conversationEventTypeGr.next()) {
            var eventType = conversationEventTypeGr.getValue('name');
            eventTypes[eventType] = conversationEventTypeGr.getUniqueValue();
        }
        return eventTypes;
    },

    _getChannels: function() {
        var channels = {};
        var customBreakdown = new GlideRecord('sn_ci_analytics_custom_breakdown');
        customBreakdown.addNullQuery('event_type');
        customBreakdown.addQuery('breakdown_name', 'channel');
        customBreakdown.query();
        while (customBreakdown.next()) {
            var name = customBreakdown.getValue('breakdown_value');
            channels[name] = customBreakdown.getUniqueValue();
        }
        return channels;
    },

    _getChannelId: function(channelName) {
        var channel = this._getPropertyValue('', CAPARConstants.BREAKDOWN.NAME.CHANNEL, channelName);
        if (channel)
            this.channels[channelName] = channel;
        return channel;
    },

    _getLanguage: function(id) {
        if (gs.nil(id))
            return;
        var languageGr = new GlideRecord('sys_language');
        languageGr.addQuery('id', id);
        languageGr.addQuery('active', true);
        languageGr.query();
        return languageGr;
    },

    _getReason: function(caConversationGr, reason) {
        if (gs.nil(caConversationGr))
            return reason;
        var reasonValue = caConversationGr.getValue('reason');
        reasonValue = gs.nil(reasonValue) ? reason : reasonValue + '\n' + reason;
        return reasonValue;
    },


    type: 'CAPARProcessor'
};
