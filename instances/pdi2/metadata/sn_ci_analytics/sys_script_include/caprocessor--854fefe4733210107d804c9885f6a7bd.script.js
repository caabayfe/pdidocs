var CAProcessor = Class.create();
CAProcessor.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger({
            source: "CAProcessor",
        });
        this.config = new CAConfig();
        this.jobMaxConversationCount = this.config.getJobMaxConversationCount();
        this.openStateConversationDays = this.config.getOpenStateConversationDays();
        this.payloadSizeCalculator = new CAPayloadSizeCalculator();
        this.payloadBuilder = new CAPayloadBuilder();
        this.evaluator = new GlideScopedEvaluator();
        this.validConversationFn = this._validationFormula();
        this.logger.info("Configuration Details {0}", new global.JSON().encode(this.config.getDetails()));
        this.CORRECT_INTENT = this.payloadBuilder.getIntentName(this.payloadBuilder.INTENT_CORRECT);
        this.AUTO_SELECTED = this.payloadBuilder.getIntentName(this.payloadBuilder.INTENT_AUTO_SELECTED);
        this.notificationConversationIds = [];
        this.openConversationIds = [];
        this.UNSUPPORTED_INTENT = this.payloadBuilder.getIntentName(this.payloadBuilder.INTENT_UNSUPPORT);
    },

    process: function() {
        try {
            var caConversationGr = this._queryCAConversation();
            while (caConversationGr.next()) {
                this.processConversation(caConversationGr);
            }
        } catch (err) {
            var message = "CI analytics processor job failed:" + err.message;
            if (err.stack)
                message = message + "\n" + err.stack;
            this.logger.error(message);
        }
    },

    processConversation: function(caConversationGr) {

        try {
            // Initializations
            var oobEventProcessor = new CAOOBEventProcessor();
            this.clickMetricsEventProcessor = new CAClickMetricsCustomEventProcessor();
            var caConversationId = caConversationGr.getUniqueValue();

            if (gs.nil(caConversationId))
                return;

            // Fetch conversation information
            var conversationGr = new GlideRecord('sys_cs_conversation');
            conversationGr.get(caConversationGr.conversation);
            if (!conversationGr.isValidRecord()) {
                // if record is invalid ignore the conversation.
                this._ignoreConversation(caConversationId, '[ETL Job]: Filtered out the empty conversation');
                return;
            }

            var conversationId = conversationGr.sys_id;

            // Fetch conversation notifications
            var notificationGr = this._queryNotification(conversationId);
            var isNonActionableNotification = false;
            while (notificationGr.next()) {
                isNonActionableNotification = !notificationGr.actionable_notification;
                if (isNonActionableNotification)
                    break;
            }

            // ignore 'notification' type conversations
            if (conversationGr.conversation_type == 'notification' || isNonActionableNotification) {
                this._ignoreConversation(caConversationId, '[ETL Job]: Filtered out the notification type conversation');
                return;
            }

            // if conversation is open more than number of days configured through property "etl.open_conversation_threshold_days" , then ignore those conversations
            if (conversationGr.state == 'open') {
                var startTime = new GlideDateTime(conversationGr.sys_updated_on);
                var scheduleJobTime = new GlideDateTime();
                if (GlideDateTime.subtract(startTime, scheduleJobTime).getDayPart() > this.openStateConversationDays) {
                    this._ignoreConversation(caConversationId, '[ETL Job]: Filtered out the conversation due to timeout');
                    return;
                }
            }
            var consumerGr = new GlideRecord('sys_cs_consumer');
            consumerGr.get(conversationGr.consumer);

            if (this._canSkipConversation(caConversationGr, conversationGr, consumerGr)) {
                var params = [conversationId, conversationGr.state, consumerGr.name];
                this.logger.info("Skipped - Conversation:{0}, Conversation State:{1}, Conversation Consumer: {2}", params);
                return;
            }

            this.payloadBuilder.initConversation(conversationId);
            this._processOverrides(conversationId);
            if (!this._conversationProcessor(caConversationGr, conversationGr, consumerGr))
                return;
            this._processEvents(conversationId, oobEventProcessor);
            caConversationGr.setValue('conversation_payload', JSON.stringify(this.payloadBuilder.getConversation()));
            caConversationGr.setValue('status', 'processed');
        } catch (err) {
            this.logger.error('[ETL Job]: An exception occurred while processing the conversation: {0}, \nerror: {1} \n{2}', [caConversationGr.getValue('conversation'), err.message, err.stack]);
            var message = '[ETL Job]: An exception occurred while processing the conversation: ' + caConversationGr.getValue('conversation');
            var reason = caConversationGr.getValue('reason');
            reason = gs.nil(reason) ? message : reason + '\n' + message;
            caConversationGr.setValue('status', 'error');
            caConversationGr.setValue('reason', reason);
        }
        caConversationGr.update();
    },

    _validConversation: function(caConversationGr, interactionGr, notificationGr) {
        if (!this.validConversationFn) {
            return true;
        }
        this.evaluator.putVariable('convGr', caConversationGr);
        this.evaluator.putVariable('interactionGr', interactionGr);
        this.evaluator.putVariable('notificationGr', notificationGr);
        return this.evaluator.evaluateScript(this.validConversationFn, "value_script", null);
    },

    _validationFormula: function() {
        var gr = new GlideRecord('sn_ci_analytics_formula_override');
        gr.addQuery('key', 'Active Conversation');
        gr.addQuery('type', 'eligibilitycriteria');
        gr.addQuery('active', true);
        gr.query();
        if (gr.next()) {
            return gr;
        }
        return null;
    },

    _queryNotification: function(conversationId) {
        var notificationGr = new GlideRecord('sys_cs_notification');
        notificationGr.addQuery('conversation', conversationId);
        notificationGr.query();
        return notificationGr;
    },

    _queryCAConversation: function() {
        var caConversationGr = new GlideRecord('sn_ci_analytics_conversation');
        caConversationGr.addQuery('sys_created_on', '>=', 'javascript:gs.beginningOfLast30Days()');
        caConversationGr.addQuery('status', 'new').addOrCondition('status', 'onHold');
        caConversationGr.orderBy('consumer');
        caConversationGr.orderBy('sys_created_on');
        if (this.jobMaxConversationCount > 0)
            caConversationGr.setLimit(this.jobMaxConversationCount);
        caConversationGr.query();
        return caConversationGr;
    },

    _canSkipConversation: function(caConversationGr, conversationGr, consumerGr) {
        var conversationId = conversationGr.sys_id;
        var state = conversationGr.state;
        var status = caConversationGr.status;
        var notificationGr = this._queryNotification(conversationId);
        while (notificationGr.next()) {
            var notificationState = notificationGr.state;
            if (notificationState == 'pending' || notificationState == 'sent') {
                var params = [conversationId, notificationState, consumerGr.name];
                this.logger.info("Skipped - Conversation:{0}, Notification State: {1}, Conversation Consumer: {2}", params);
                return true;
            }
        }
        if (state == 'open' || state == 'chatInProgress' || status == 'onHold')
            return true;
    },

    _updateConversationStateAsIgnored: function(caConversationGr, reason) {
        if (reason)
            caConversationGr.setValue('reason', reason);
        caConversationGr.setValue('status', 'ignored');
        caConversationGr.update();
        this.logger.info('Conversation ignored: {0}, reason: {1}', [caConversationGr.conversation, reason]);
    },

    _ignoreConversation: function(caConversationId, reason) {
        var record = new GlideRecord('sn_ci_analytics_conversation');
        record.addQuery('sys_id', caConversationId);
        record.query();
        if (record.next()) {
            if (reason)
                record.setValue('reason', reason);
            record.setValue('status', 'ignored');
            record.update();
        }
    },

    _conversationProcessor: function(caConversationGr, conversationGr, consumerGr) {
        var conversationId = conversationGr.sys_id;
        var interactionGr = this._queryInteraction(conversationId);
        var notificationGr = this._queryNotification(conversationId);
        if (!this._validConversation(caConversationGr, interactionGr, notificationGr)) {
            this._updateConversationStateAsIgnored(caConversationGr, '[ETL Job]: Filtered out from the "Active Conversation" formula override');
            return false;
        }
        this.payloadBuilder.buildConversation(caConversationGr, interactionGr, conversationGr);
        this.payloadBuilder.addUser(conversationGr, consumerGr);
        var conversationTask = this.payloadBuilder.queryConversationTask(conversationId);
        var intentPrediction = {
            isCorrectPrediction: false,
            isAutoSelected: false,
            isUnsupportedPrediction: false,
        };
        var nluIntents = [];
        var taskIds = [];
        while (conversationTask.next()) {
            var topicTypeGr = new GlideRecord('sys_cs_topic');
            topicTypeGr.get(conversationTask.topic_type);
            var topicName = topicTypeGr.name;
            taskIds.push(conversationTask.getValue('sys_id'));
            if (this._isPreviewedConversation(topicName)) {
                var params = [conversationTask.getValue('sys_id'), topicName];
                this._updateConversationStateAsIgnored(caConversationGr, '[ETL Job]: Previewed Conversation');
                this._logDebug('ConversationTask: {1}, Previwed topic found {2}, conversation ignored.', conversationId, params);
                return false;
            }

            if (this._filterInternalTopicBlock(conversationTask))
                continue;

            if (topicName)
                this.payloadBuilder.addTopic(conversationTask, topicTypeGr);
            this._processIntents(conversationTask, conversationId, nluIntents, intentPrediction);
            this.payloadBuilder.addTopicNodes(conversationTask, topicTypeGr);
        }
        this._modifyIntentEvents(nluIntents, intentPrediction);
        this.payloadBuilder.addIntentsToConversation(nluIntents);
        this.payloadBuilder.updateDeflectionCount(taskIds);
        return true;
    },

    _filterInternalTopicBlock: function(taskGr) {
        if (taskGr.topic_type.type == 'TOPIC_BLOCK' && taskGr.calling_task.topic_type.type == 'SETUP_TOPIC')
            return true;
        return false;
    },

    _isPreviewedConversation: function(topicName) {
        if (!gs.nil(topicName) && topicName.startsWith('_PRVW_'))
            return true;

        return false;
    },

    _queryInteraction: function(conversationId) {
        var interactionGr = new GlideRecord('interaction');
        interactionGr.addQuery('channel_metadata_document', conversationId);
        interactionGr.addQuery('channel_metadata_table', 'sys_cs_conversation');
        interactionGr.query();
        interactionGr.next();
        return interactionGr;
    },

    _processIntents: function(conversationTask, conversationId, nluIntents, intentPrediction) {
        var openNluIntentFeedbackGr = new GlideRecord('open_nlu_predict_intent_feedback');
        openNluIntentFeedbackGr.addQuery('app_document_table', 'sys_cs_conversation_task');
        openNluIntentFeedbackGr.addQuery('app_document', conversationTask.sys_id);
        //openNluIntentFeedbackGr.addQuery('mapped', true);
        //openNluIntentFeedbackGr.addNotNullQuery('prediction');
        openNluIntentFeedbackGr.query();
        if (openNluIntentFeedbackGr.getRowCount() > 1) {
            this.payloadBuilder.updateMutiplePredictionsCount();
        }
        while (openNluIntentFeedbackGr.next()) {
            var prediction = openNluIntentFeedbackGr.prediction;
            var nluIntentGr = new GlideRecord('sys_nlu_intent');
            nluIntentGr.addQuery('name', prediction);
            nluIntentGr.query();
            if (!nluIntentGr.next())
                this._logDebug("Nlu intent not found in sys_nlu_intent table for predication: {1}", conversationId, [prediction]);
            var topicLangGr = new GlideRecord('sys_cs_topic_language');
            topicLangGr.addQuery('nlu_intent', prediction);
            topicLangGr.addQuery('cs_topic_id.active', true);
            topicLangGr.query();
            if (!topicLangGr.next())
                this._logDebug("Topic not found in sys_cs_topic_language table for nlu intent: {1}", conversationId, [prediction]);
            var intentEvent = this.payloadBuilder.buildIntentEvent(openNluIntentFeedbackGr, nluIntentGr, topicLangGr);
            if (intentEvent['Name'] == this.UNSUPPORTED_INTENT) {
                intentPrediction.isUnsupportedPrediction = true;
            }
            if (intentEvent['Name'] == this.CORRECT_INTENT)
                intentPrediction.isCorrectPrediction = true;

            if (intentEvent['Name'] == this.AUTO_SELECTED)
                intentPrediction.isAutoSelected = true;

            nluIntents.push(intentEvent);
        }
    },

    _modifyIntentEvents: function(nluIntents, intentPrediction) {
        var correctName;
        if (intentPrediction.isUnsupportedPrediction)
            correctName = this.UNSUPPORTED_INTENT;
        else if (intentPrediction.isCorrectPrediction)
            correctName = this.CORRECT_INTENT;
        else if (intentPrediction.isAutoSelected)
            correctName = this.AUTO_SELECTED;
        else
            return;

        nluIntents.forEach(function(event) {
            event['Name'] = correctName;
        });
    },

    _processEvents: function(conversationId, oobEventProcessor) {
        oobEventProcessor.process(this.payloadBuilder);
        this.clickMetricsEventProcessor.process(this.payloadBuilder);
        var eventsGr = new GlideRecord('sn_ci_analytics_event');
        eventsGr.addQuery('active', true);
        eventsGr.query();
        while (eventsGr.next()) {
            var queryTable = eventsGr.source_table;
            var condition = eventsGr.source_table_filter;
            var conversationMappingField = eventsGr.conversation_mapping_field;
            this.payloadBuilder.preProcessCustomEvent(eventsGr);

            var sourceGr = new GlideRecord(queryTable);
            if (sourceGr.isValid()) {
                var query = conversationMappingField + "=" + conversationId;
                if (!(condition == null || condition == ''))
                    query = query + "^" + condition;
                sourceGr.addEncodedQuery(query);
                sourceGr.query();
                while (sourceGr.next())
                    this.payloadBuilder.addCustomEvent(sourceGr, eventsGr);
            }
        }
    },

    _processOverrides: function(conversationId) {
        var overridesGr = new GlideRecord('sn_ci_analytics_formula_override');
        overridesGr.addQuery('type', '!=', 'eligibilitycriteria');
        overridesGr.addQuery('active', true);
        overridesGr.query();
        while (overridesGr.next())
            this.payloadBuilder.processOverride(overridesGr, conversationId);
    },

    shouldHoldAnalyticsConversation: function(conversationGr) {
        if (!gs.nil(conversationGr)) {
            var liveAgentTransferTime = conversationGr.live_agent_transfer_time;
            if (liveAgentTransferTime) {
                var interactionGR = new GlideRecord('interaction');
                interactionGR.get('channel_metadata_document', conversationGr.sys_id);
                return 'phone' == interactionGR.type;
            }
        }
        return false;
    },

    isInteractionClosed: function(conversationId) {
        if (gs.nil(conversationId))
            return false;
        var interactionGR = new GlideRecord('interaction');
        interactionGR.addEncodedQuery('state=closed_complete^ORstate=closed_abandoned^channel_metadata_table=sys_cs_conversation^channel_metadata_document=' + conversationId);
        interactionGR.query();
        return interactionGR.hasNext();
    },

    _logDebug: function(msg_template, conversationId, params) {
        if (this.logger.isDebugEnabled()) {
            var arrayUtil = new global.ArrayUtil();
            var defaultParams = [conversationId];
            var argParams = arrayUtil.convertArray(params);
            var mergedArray = arrayUtil.union(defaultParams, argParams);
            msg_temp = "Conversation:{0}, " + msg_template;
            this.logger.debug(msg_temp, mergedArray);
        }
    },

    type: 'CAProcessor'
};
