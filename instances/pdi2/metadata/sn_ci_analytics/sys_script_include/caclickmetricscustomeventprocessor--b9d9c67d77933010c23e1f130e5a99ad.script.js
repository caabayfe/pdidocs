var CAClickMetricsCustomEventProcessor = Class.create();

var eventInfoRequiredByEventName = {
    AI_SEARCH_TRIGGERED: ['Search Term', 'Results Count', 'Language', 'Results Count'],
    AI_SEARCH_RESULT_CLICKED: ['Order', 'Search Term', 'Title', 'Description'],
    AI_SEARCH_RESULT_DISPLAYED: ['Title', 'Search Term', 'Description', 'Data Source Title', 'Document Table'],
    CONTEXTUAL_SEARCH_TRIGGERED: ['Search Term', 'Results Count', 'Language', 'Results Count'],
    CONTEXTUAL_SEARCH_RESULT_DISPLAYED: ['Title', 'Search Term', 'Description', 'Data Source Title', 'Document Table'],
    CONTEXTUAL_SEARCH_RESULT_CLICKED: ['Order', 'Search Term', 'Title', 'Description'],
    SEARCH_RESULT_CLICKED: ['Order', 'Search Term', 'Title', 'Description'],
    BOT_OUTPUT_CREATED: ['Header', 'Name', 'Results Count', 'Search Term'],
    BOT_OUTPUT_LINK_DISPLAYED: ['URL', 'Control Type', 'Order', 'Search Term'],
    BOT_OUTPUT_LINK_CLICKED: ['Order', 'Search Term', 'URL'],
}
CAClickMetricsCustomEventProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger({
            source: "CASearchCustomEventProcessor"
        });
        this.conversationEventsInfo = {};
        this.isAISearchTriggered = false;
        this.payloadBuilder = {};
    },

    process: function(payloadBuilder) {
        try {
            //initiating conversation with empty data
            this.conversationEventsInfo = {};
            this.payloadBuilder = payloadBuilder;
            var conversation = payloadBuilder.getConversation();
            var conversationId = conversation.Id;
            // preprocessing conversation click metrics events
            this._preProcessConversationSearchInfo(conversationId);
            var events = this._generateEvents();
            // pushing events to conversation custome events list
            events.forEach(function(event) {
                payloadBuilder.getConversation()['Events'].push(event);
            });
            if (this.isAISearchTriggered) {
                payloadBuilder.setAISearchInvokedStatus();
            }
        } catch (err) {
            var message = "CI analytics search metrics processing failed:" + err.message;
            if (err.stack)
                message = message + "\n" + err.stack;
            this.logger.error(message);
        }
    },

    // Mimics Object.values() function & Returns values
    _ObjectValues: function(obj) {
        obj = obj ? obj : {};
        return Object.keys(obj).map(function(key) {
            return obj[key];
        });
    },


    _createSearchEvents: function(searchInfo) {
        var events = [];
        var eventTypes = Object.keys(searchInfo);
        var isAISearch = true;
        var results = [];
        var _this = this;
        eventTypes.forEach(function(eventType) {
            if (eventType == CAConstants.eventNames.AI_SEARCH_TRIGGERED) {
                events.push(searchInfo.AI_SEARCH_TRIGGERED);
            } else if (eventType == CAConstants.eventNames.AI_SEARCH_RESULT_DISPLAYED) {
                results = _this._ObjectValues(searchInfo.AI_SEARCH_RESULT_DISPLAYED);
                events = events.concat(results);
            } else if (eventType == CAConstants.eventNames.CONTEXTUAL_SEARCH_TRIGGERED) {
                isAISearch = false;
                events.push(searchInfo.CONTEXTUAL_SEARCH_TRIGGERED);
            } else if (eventType == CAConstants.eventNames.CONTEXTUAL_SEARCH_RESULT_DISPLAYED) {
                results = _this._ObjectValues(searchInfo.CONTEXTUAL_SEARCH_RESULT_DISPLAYED);
                events = events.concat(results);
            }
        });
        if (!this.isAISearchTriggered && isAISearch) {
            this.isAISearchTriggered = true;
        }
        if (isAISearch) {
            var searchResutltsClicked = searchInfo[CAConstants.eventNames.AI_SEARCH_RESULT_CLICKED] ? searchInfo[CAConstants.eventNames.AI_SEARCH_RESULT_CLICKED] : searchInfo.SEARCH_RESULT_CLICKED;
            results = this._ObjectValues(searchResutltsClicked);
            results.forEach(function(result) {
                result.Name = CAConstants.eventNames.AI_SEARCH_RESULT_CLICKED;
                var searchClickedInfo = searchInfo.AI_SEARCH_RESULT_DISPLAYED[result.Properties['Order']];
                Object.keys(searchClickedInfo.Properties).forEach(function(key) {
                    result.Properties[key] = searchClickedInfo.Properties[key];
                });
            });
            if (!searchInfo.AI_SEARCH_RESULT_CLICKED) {
                searchInfo[CAConstants.eventNames.AI_SEARCH_RESULT_CLICKED] = searchInfo.SEARCH_RESULT_CLICKED;
            }
            events = events.concat(results);
        } else {
            results = this._ObjectValues(searchInfo.SEARCH_RESULT_CLICKED);
            results.forEach(function(result) {
                result.Name = CAConstants.eventNames.CONTEXTUAL_SEARCH_RESULT_CLICKED;
                var searchClickedInfo = searchInfo.CONTEXTUAL_SEARCH_RESULT_DISPLAYED[result.Properties['Order']];
                Object.keys(searchClickedInfo.Properties).forEach(function(key) {
                    result.Properties[key] = searchClickedInfo.Properties[key];
                });
            });
            events = events.concat(results);
            searchInfo[CAConstants.eventNames.CONTEXTUAL_SEARCH_RESULT_CLICKED] = searchInfo.SEARCH_RESULT_CLICKED;
        }

        if (isAISearch) {
            var aiSearchResults = searchInfo.AI_SEARCH_RESULT_DISPLAYED;
            var hasSearchResults = aiSearchResults && Object.keys(aiSearchResults).length;
            if (!hasSearchResults) {
                events.push({
                    Name: CAConstants.eventNames.AI_SEARCH_ZERO_RESULTS,
                    Type: 'Custom',
                    Properties: searchInfo.AI_SEARCH_TRIGGERED.Properties,
                    par_payload: searchInfo.AI_SEARCH_TRIGGERED.par_payload,
                    Time: searchInfo.AI_SEARCH_TRIGGERED.Time
                });
            }
            var aiSearchResultsClicked = searchInfo.AI_SEARCH_RESULT_CLICKED;
            var hasSearchResultsClicked = aiSearchResultsClicked && Object.keys(aiSearchResultsClicked).length;
            if (hasSearchResults && !hasSearchResultsClicked) {
                events.push({
                    Name: CAConstants.eventNames.AI_SEARCH_ZERO_CLICKS,
                    Type: 'Custom',
                    Properties: searchInfo.AI_SEARCH_TRIGGERED.Properties,
                    par_payload: searchInfo.AI_SEARCH_TRIGGERED.par_payload,
                    Time: searchInfo.AI_SEARCH_TRIGGERED.Time
                });
            }
        } else {
            var contextualSearchResults = searchInfo.CONTEXTUAL_SEARCH_RESULT_DISPLAYED;
            var hasContextualSearchResults = contextualSearchResults && Object.keys(contextualSearchResults).length;
            if (!hasContextualSearchResults) {
                events.push({
                    Name: CAConstants.eventNames.CONTEXTUAL_SEARCH_ZERO_RESULTS,
                    Type: 'Custom',
                    Properties: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.Properties,
                    par_payload: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.par_payload,
                    Time: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.Time
                });
            }
            var contextualSearchResultsClicked = searchInfo.CONTEXTUAL_SEARCH_RESULT_CLICKED;
            var hasContextualSearchResultsClicked = contextualSearchResultsClicked && Object.keys(contextualSearchResultsClicked).length;
            if (hasContextualSearchResults && !hasContextualSearchResultsClicked) {
                events.push({
                    Name: CAConstants.eventNames.CONTEXTUAL_SEARCH_ZERO_CLICKS,
                    Type: 'Custom',
                    Properties: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.Properties,
                    par_payload: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.par_payload,
                    Time: searchInfo.CONTEXTUAL_SEARCH_TRIGGERED.Time
                });
            }
        }
        return events;
    },

    _createBotEvents: function(botInfo) {
        var events = [];
        var results = [];
        var hasBotOutResults = false;
        events.push(botInfo.BOT_OUTPUT_CREATED);
        if (botInfo.BOT_OUTPUT_LINK_DISPLAYED) {
            hasBotOutResults = true;
            results = this._ObjectValues(botInfo.BOT_OUTPUT_LINK_DISPLAYED);
            events = events.concat(results);
        } else {
            events.push({
                Name: CAConstants.eventNames.BOT_OUTPUT_ZERO_RESULTS,
                Type: 'Custom',
                Properties: botInfo.BOT_OUTPUT_CREATED.Properties,
                par_payload: botInfo.BOT_OUTPUT_CREATED.par_payload,
                Time: botInfo.BOT_OUTPUT_CREATED.Time
            });
        }
        if (botInfo[CAConstants.eventNames.BOT_OUTPUT_LINK_CLICKED]) {
            results = this._ObjectValues(botInfo[CAConstants.eventNames.BOT_OUTPUT_LINK_CLICKED]);
            results.forEach(function(result) {
                var botClickedInfo = botInfo.BOT_OUTPUT_LINK_DISPLAYED[result.Properties['Order']];
                Object.keys(botClickedInfo.Properties).forEach(function(key) {
                    result.Properties[key] = botClickedInfo.Properties[key];
                });
            });
            events = events.concat(results);
        } else if (hasBotOutResults) {
            events.push({
                Name: CAConstants.eventNames.BOT_OUTPUT_ZERO_CLICKS,
                Type: 'Custom',
                Properties: botInfo.BOT_OUTPUT_CREATED.Properties,
                par_payload: botInfo.BOT_OUTPUT_CREATED.par_payload,
                Time: botInfo.BOT_OUTPUT_CREATED.Time,
            });
        }
        return events;
    },

    _generateEvents: function() {
        var ids = Object.keys(this.conversationEventsInfo);
        var events = [];
        var _this = this;
        ids.forEach(function(id) {
            var info = _this.conversationEventsInfo[id];
            if (info.type == 'search') {
                var searchEvents = _this._createSearchEvents(info);
                events = events.concat(searchEvents);
            } else if (info.type == 'bot-links') {
                var botEvents = _this._createBotEvents(info);
                events = events.concat(botEvents);
            }
        });
        return events;
    },

    _cleanAttributes: function(attributes, customEventName) {
        var eventAttributes = {};
        if (eventInfoRequiredByEventName[customEventName]) {
            eventInfoRequiredByEventName[customEventName].forEach(function(attributeName) {
                eventAttributes[attributeName] = attributes[attributeName];
            });
            return eventAttributes;
        }
        return attributes;
    },

    _fetchEventFromGroupAttributes: function(attributes, customEventName) {
        var event = {
            Name: customEventName,
            Type: 'Custom',
            Time: attributes['Response Time'] ? parseInt(attributes['Response Time']) : 0,
        }
        event.Properties = this._cleanAttributes(attributes, customEventName);
        event.par_payload = {
            created_on: attributes['created_on'],
        };
        return event;
    },

    _customEventName: function(searchType, eventName, resultType) {
        if (searchType && searchType.includes('AI Search')) {
            return 'AI_' + eventName;
        } else if (searchType == 'Contextual') {
            return 'CONTEXTUAL_' + eventName;
        } else if (resultType && resultType.includes('AI Search')) {
            return 'AI_' + eventName;
        }
        return eventName;
    },

    _fetchSearchStringFromContext: function(rec) {
        try {
            var context = rec.getValue('context').substring(16);
            var taskContext = new global.VAGlobalUtil().getDecompressedValue(context);
            // Returns either JSON or XML as the context format
            var taskContextType = rec.conversation.context_format ? rec.conversation.context_format : 'XML';

            if (taskContextType == 'XML') {
                var xmlDoc = new XMLDocument2();
                xmlDoc.parseXML(taskContext);
                var searchValue = xmlDoc.getNodeText("/com.glide.cs.qlue.entities.TaskContext/values/entry[string='search_text']/com.glide.cs.qlue.entities.TypedValue/value");
                return searchValue;
            } else {
                var jsonData = JSON.parse(taskContext);
                var retrievedValue = null;
                if (jsonData && jsonData.values && jsonData.values.search_text && jsonData.values.search_text.value)
                    retrievedValue = jsonData.values.search_text.value;

                return retrievedValue;
            }
        } catch (e) {
            return false;
        }
    },

    _appendTopicAndSearchTermInfo: function(attributes) {
        var documentId = attributes['document_id'];
        var documentRef = attributes['document_ref'];
        var rec = new GlideRecord(documentRef);
        rec.get(documentId);
        var topicId = rec.getValue('topic_type');
        var searchTerm = this._fetchSearchStringFromContext(rec);
        if (searchTerm) {
            attributes['Search Term'] = searchTerm
        } else {
            var topicGR = new GlideRecord('sys_cs_topic');
            topicGR.get(topicId);
            attributes['Search Term'] = topicGR.getValue('name');
            attributes['Topic'] = topicGR.getValue('name');
        }
    },

    _updateConversationInfoBasedOnEventName: function(id, attributes, eventFrom, conversationId) {
        var eventName = attributes.Name;
        var customEventName = '';
        var eventInfo = this.conversationEventsInfo[id];
        if (eventFrom == 'search') {
            var searchType = attributes['Search Type'];
            var resultType = attributes['Result Type'];
            customEventName = this._customEventName(searchType, eventName, resultType);
            if (eventName == 'SEARCH_TRIGGERED') {
                eventInfo[customEventName] = this._fetchEventFromGroupAttributes(attributes, customEventName);
            } else if (eventName == 'SEARCH_RESULT_DISPLAYED') {
                eventInfo[customEventName] = eventInfo[customEventName] ? eventInfo[customEventName] : {};
                eventInfo[customEventName][attributes['Order']] = this._fetchEventFromGroupAttributes(attributes, customEventName);
                if (resultType && (attributes['Result Type'].equals("AI Search - Genius") ||
                        (attributes['Result Type'].equals("AI Search - Standard") &&
                            attributes['Document Table'] && attributes['Document Table'].includes('kb_knowledge'))))
                    this.payloadBuilder.updateSharedKBCount();
            } else if (eventName == 'SEARCH_RESULT_CLICKED') {
                eventInfo[customEventName] = eventInfo[customEventName] ? eventInfo[customEventName] : {};
                eventInfo[customEventName][attributes['Order']] = this._fetchEventFromGroupAttributes(attributes, customEventName);
            }
        } else if (eventFrom == 'bot-links') {
            this._appendTopicAndSearchTermInfo(attributes);
            if (eventName == CAConstants.eventNames.BOT_OUTPUT_CREATED) {
                eventInfo[CAConstants.eventNames.BOT_OUTPUT_CREATED] = this._fetchEventFromGroupAttributes(attributes, CAConstants.eventNames.BOT_OUTPUT_CREATED);
            } else if (eventName == CAConstants.eventNames.BOT_OUTPUT_LINK_DISPLAYED) {
                customEventName = CAConstants.eventNames.BOT_OUTPUT_LINK_DISPLAYED;
                eventInfo[customEventName] = eventInfo[customEventName] ? eventInfo[customEventName] : {};
                eventInfo[customEventName][attributes['Order']] = this._fetchEventFromGroupAttributes(attributes, customEventName);
                if (attributes['URL'].includes('kb_knowledge'))
                    this.payloadBuilder.updateSharedKBCount();
            } else if (eventName == CAConstants.eventNames.BOT_OUTPUT_LINK_CLICKED) {
                customEventName = CAConstants.eventNames.BOT_OUTPUT_LINK_CLICKED;
                eventInfo[customEventName] = eventInfo[customEventName] ? eventInfo[customEventName] : {};
                eventInfo[customEventName][attributes['Order']] = this._fetchEventFromGroupAttributes(attributes, customEventName);
            }
        }
    },

    _preProcessConversationSearchInfo: function(conversationId) {
        var groupIdsGr = this._fetchConversationSearchGroups(conversationId);
        while (groupIdsGr.next()) {
            var groupId = groupIdsGr.getValue('group_id');
            var attributesOfSearchGroup = this._fetchGroupAttributes(groupId, conversationId);
            var searchId = attributesOfSearchGroup['Search Id'];
            var correlationId = attributesOfSearchGroup['Correlation Id'];
            if (searchId && searchId != 'undefined') {
                if (this.conversationEventsInfo[searchId]) {
                    this._updateConversationInfoBasedOnEventName(searchId, attributesOfSearchGroup, 'search', conversationId);
                } else {
                    this.conversationEventsInfo[searchId] = {
                        type: 'search'
                    };
                    this._updateConversationInfoBasedOnEventName(searchId, attributesOfSearchGroup, 'search', conversationId);
                }
            } else if (correlationId && correlationId != 'undefined') {
                if (this.conversationEventsInfo[correlationId]) {
                    this._updateConversationInfoBasedOnEventName(correlationId, attributesOfSearchGroup, 'bot-links', conversationId);
                } else {
                    this.conversationEventsInfo[correlationId] = {
                        type: 'bot-links'
                    };
                    this._updateConversationInfoBasedOnEventName(correlationId, attributesOfSearchGroup, 'bot-links', conversationId);
                }
            }
        }
    },

    _fetchGroupAttributes: function(groupId, conversationId) {
        var attributes = {};
        var rec = new GlideRecord('sys_ci_analytics');
        rec.addQuery('conversation', conversationId);
        rec.addQuery('group_id', groupId);
        rec.query();
        while (rec.next()) {
            var jsonObj = JSON.parse(rec.getValue("metric"));
            attributes['document_ref'] = rec.getValue('document_ref');
            attributes['document_id'] = rec.getValue('document_id');
            attributes['created_on'] = rec.getValue('sys_created_on');
            for (key in jsonObj) {
                attributes[key] = jsonObj[key];
            }
        }
        return attributes;
    },

    _fetchConversationSearchGroups: function(conversationId) {
        var rec = new GlideAggregate('sys_ci_analytics');
        rec.addQuery('conversation', conversationId);
        rec.groupBy('group_id');
        rec.query();
        return rec;
    },

    type: 'CAClickMetricsCustomEventProcessor'
};
