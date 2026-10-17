var VAChatTranscriptBuilder = Class.create();

VAChatTranscriptBuilder.prototype = {

    initialize: function(conversationId) {
        this.conversationId = conversationId;
        this.conversationGr = this.getConversationGr();
        this.transcript = {};
        this.fdihIvocations = {};
        this.topicBlockDetails = {};
    },

    getConversationGr: function() {
        var gr = new GlideRecord(VATranscriptBuilderConstants.SYS_CS_CONVERSATION);
        gr.get(this.conversationId);

        return gr;
    },

    _getConversationTaskGr: function(conversationTaskId) {

        var gr = new GlideRecord('sys_cs_conversation_task');
        gr.get(conversationTaskId);

        return gr;
    },

    _addNewLine: function() {
        this.transcript[VATranscriptBuilderConstants.NEW_LINE_CHARACTER + ' '] = "#NL";
    },

    _addToTranscriptWithNewLine: function(key, value) {
        key = VATranscriptBuilderConstants.NEW_LINE_CHARACTER + key;
        this.transcript[key] = value;
    },

    addConversationDetails: function() {
        var gr = this.conversationGr;

        this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.CONVERSATION_ID, this.conversationId);
        this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.CONVERSATION_CREATED_ON, gr.getValue('sys_created_on'));
        this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.CHANNEL, gr.getDisplayValue('device_type'));
        this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.USER_NAME, gr.consumer.getDisplayValue('name'));
        var status = gr.consumer.user_id.active.toString() == "true" ? "ACTIVE" : "INACTIVE";
        this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.USER_STATUS, status);

        this.addAgentDetails();
        this.getFDIHLogs();
        this.getTopicBlockLogs();

    },

    addAgentDetails: function() {
        var gr = new GlideRecord('interaction');
        gr.addQuery('channel_metadata_table', VATranscriptBuilderConstants.SYS_CS_CONVERSATION);
        gr.addQuery('channel_metadata_document', this.conversationId);
        gr.query();
        if (!gr.next()) return;

        if (gr.getDisplayValue("agent_chat") == "true") {
            this._addNewLine();
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.AGENT_CHAT, "");
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.LIVE_AGENT_HANDOFF, gr.getValue('live_handoff_time'));
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.ASSIGNED_AT, gr.getValue('assigned_at'));
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.AGENT_NAME, gr.getDisplayValue('assigned_to'));
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.AGENT_GROUP, gr.getDisplayValue('assignment_group'));
            this._addToTranscriptWithNewLine(VATranscriptBuilderConstants.CLOSED_AT, gr.getValue('closed_at'));
        }
    },

    _getTopicInformation: function(topicId) {

        var gr = new GlideRecord('sys_cs_topic');
        gr.get(topicId);

        if (!gr.isValidRecord()) return;

        var topic = {};
        topic['name'] = gr.getDisplayValue('name');
        topic['roles'] = gr.getDisplayValue('roles');
        topic['type'] = gr.getValue('type');
        return topic;
    },

    addNLUInfo: function(conversationTaskId) {

        var gr = new GlideRecord('open_nlu_predict_intent_feedback');
        gr.addQuery('app_document_table', 'sys_cs_conversation_task');
        gr.addQuery('app_document', conversationTaskId);
        gr.addNotNullQuery('confidence');
        gr.query();
        var prediction = {};

        while (gr.next()) {
            prediction['Utterance'] = gr.getValue('utterance');
            prediction['Auto Selected'] = gr.getValue('auto_selected');
            prediction['Confidence'] = gr.nlu_model.getDisplayValue('confidence_threshold');
            prediction['Topic Switched'] = gr.getDisplayValue('topic_switched');
            prediction['Prediction'] = gr.getValue('prediction');
            prediction['Duration'] = gr.audit_log.getDisplayValue('duration');
            prediction['Threshold'] = gr.getValue('confidence');
            prediction['Language'] = gr.nlu_model.getDisplayValue('language');
            prediction['User Confirmation'] = gr.getDisplayValue('user_confirmation');
            prediction['Selected'] = gr.getValue('selected');
            var topicLangGr = new GlideRecord('sys_cs_topic_language');
            topicLangGr.addQuery('nlu_intent', prediction['prediction']);
            topicLangGr.setLimit(1);
            topicLangGr.query();
            if (topicLangGr.next()) {
                prediction['Topic'] = topicLangGr.getDisplayValue('cs_topic_id');
            }
        }
        return prediction;
    },

    _getMessageValue: function(payload) {
        var result = {};

        switch (payload.uiType) {
            case 'OutputText':
            case 'InputText':
            case 'FileUpload':
            case 'Picture':
            case 'Date':
            case 'DateTime':
            case 'Time':
            case 'Boolean':
            case 'OutputHtml':
            case 'OutputImage':
                return payload.value || payload.plainTextMessage;
            case 'Picker':
                if (payload.value) return payload.value;

                result['label'] = payload.uiMetadata.label;
                var keys_to_keep = ['label', 'value'];
                var options = payload.uiMetadata.options.map(function(e) {
                    var obj = {};
                    keys_to_keep.forEach(function(k) {
                        obj[k] = e[k];
                    });
                    return obj;
                });
                result['options'] = options;
                return result;
            case 'OutputCard':
                return JSON.parse(payload.value || payload.uiMetadata.data);
            case 'OutputTable':
                result['label'] = payload.uiMetadata.label;
                result['headers'] = payload.uiMetadata.headers;
                result['data'] = payload.uiMetadata.data;
                return result;
            case 'OutputLink':
                return payload.uiMetadata;
            case 'TopicPickerControl':
                return payload.searchText;
            case 'MultiPartOutput':
                if (payload.content) {
                    result['uiType'] = payload.content.uiType;
                    result['value'] = payload.content.value;
                }
                return result;
            case 'CustomControl':
                payload.serializedControlData ? (result['serializedControlData'] = JSON.parse(payload.serializedControlData)) : null;
                payload.name ? (result['name'] = payload.name) : null;
                payload.input ? (result['input'] = payload.input) : null;
                payload.value ? (result['value'] = payload.value) : null;
                return result;
            default:
                return null;
        }
    },

    addUtilityLogs: function(lastMessageId) {

        if (this.topicBlockDetails[lastMessageId]) {
            var blockDetails = this.topicBlockDetails[lastMessageId];
            var topicBlockUniqueKey = blockDetails.topicBlockUniqueKey;
            delete blockDetails["topicBlockUniqueKey"];
            this.transcript[topicBlockUniqueKey] = blockDetails;
        }

        if (this.fdihIvocations[lastMessageId]) {
            var invocation = this.fdihIvocations[lastMessageId];
            var fdihUniqueKey = invocation.fdihUniqueKey;
            delete invocation["fdihUniqueKey"];
            this.transcript[fdihUniqueKey] = invocation;
        }
    },

    addMessages: function() {
        var gr = new GlideRecord('sys_cs_message');
        gr.addQuery('conversation', this.conversationId);
        gr.orderBy('sequence');
        gr.query();

        var messages = [];
        var currentTopic = {};

        while (gr.next()) {
            var payload = gr.getValue('payload');
            var message = {};

            if (gr.getValue('message_type').equals('text')) {
                message['value'] = payload;
                message["Type"] = 'text';
            } else {
                payload = JSON.parse(payload);
                message['value'] = this._getMessageValue(payload);
                message["Type"] = payload.uiType;
            }

            if (!message.value) {
                this.addUtilityLogs(gr.getUniqueValue());
                continue;
            }

            var messageUniqueKey = '';
            if (gr.getValue('direction') === 'inbound') {
                messageUniqueKey = this._getMessageUniqueKey("User Input: ", gr.getValue('sys_created_on'), gr.consumer.getDisplayValue('name'));
                var nluDetails = this.addNLUInfo(gr.getValue('task'));
                nluDetails && nluDetails['Utterance'] ? this._addToTranscriptWithNewLine("NLU Information for utternace - " + message.value, nluDetails) : null;
            } else if (gr.getDisplayValue('is_agent') === 'true') {
                messageUniqueKey = this._getMessageUniqueKey("Live Agent: ", gr.getValue('sys_created_on'), gr.sender_profile.getDisplayValue('display_name'));
            } else {
                messageUniqueKey = this._getMessageUniqueKey("Bot Response: ", gr.getValue('sys_created_on'), "Virtual Agent");
            }

            var topicNodeName = payload.model && payload.model.name;
            (topicNodeName && topicNodeName.includes("fieldAck")) ? null: (message[VATranscriptBuilderConstants.TOPIC_NODE_NAME] = topicNodeName);

            var conversation_task_gr = this._getConversationTaskGr(gr.getValue('task'));
            var topic = this._getTopicInformation(conversation_task_gr.getValue('topic_type'));
            if (currentTopic && currentTopic.name != topic.name) {
                var topicUniqueKey = VATranscriptBuilderConstants.NEW_LINE_CHARACTER + "Topic Started " + VATranscriptBuilderConstants.NEW_LINE_CHARACTER + topic.name;
                this._addToTranscriptWithNewLine(topicUniqueKey, topic);
                currentTopic = topic;
            }


            if (this.transcript[messageUniqueKey]) {
                this.transcript[messageUniqueKey].push(message);
            } else {
                this.transcript[messageUniqueKey] = [message];
            }

            this.addUtilityLogs(gr.getUniqueValue());
        }
    },

    _getMessageUniqueKey: function(senderRole, time, name) {
        return VATranscriptBuilderConstants.NEW_LINE_CHARACTER + senderRole +
            VATranscriptBuilderConstants.NEW_LINE_CHARACTER + time + " " + name;
    },

    getTopicBlockLogs: function() {
        var topicBlocksData = sn_cs.VASystemObject.getTopicBlockDataFromConversation(this.conversationId);
        var topicBlockLogs = {};

        for (var i = 0; i < topicBlocksData.length; i++) {
            var result = {};
            result.topicBlockId = topicBlocksData[i].topicBlockId;
            topicBlocksData[i].inputsAsString ? result.inputs = JSON.parse(topicBlocksData[i].inputsAsString) : null;
            topicBlocksData[i].outputsAsString ? result.outputs = JSON.parse(topicBlocksData[i].outputsAsString) : null;
            result.topicBlockUniqueKey = VATranscriptBuilderConstants.NEW_LINE_CHARACTER + "Topic Block Details: " + result.topicBlockId;
            topicBlockLogs[topicBlocksData[i].lastMessageId] = result;
        }

        this.topicBlockDetails = topicBlockLogs;
    },

    getFDIHLogs: function() {

        var invocations = sn_cs.VASystemObject.getFDIHInvocationsFromConversation(this.conversationId);
        var fdihInvocations = {};

        for (var i = 0; i < invocations.length; ++i) {
            var result = {};
            var invocation = invocations[i];

            result.type = invocation.type;
            result.fdihInvocationId = invocation.fdihInvocationId;
            result.name = invocation.name;
            result.callingCsConversationTask = invocation.callingCsConversationTask;
            result.executionContext = invocation.executionContext;
            result.executionMode = invocation.executionMode;
            invocation.inputsAsString ? result.inputs = JSON.parse(invocation.inputsAsString) : null;
            invocation.outputsAsString ? result.outputs = JSON.parse(invocation.outputsAsString) : null;
            result.outputsReceivedOn = invocation.outputsReceivedOn;
            result.responseState = invocation.responseState;
            result.sentOn = invocation.sentOn;
            invocation.timedOutOn != "" ? result.timedOutOn = invocation.timedOutOn : null;
            invocation.cancelledOn != "" ? result.cancelledOn = invocation.cancelledOn : null;
            invocation.cancelledReason != "" ? result.cancelledReason = invocation.cancelledReason : null;
            invocation.error != "" ? result.error = invocation.error : null;
            invocation.erroredOn != "" ? result.erroredOn = invocation.erroredOn : null;

            var conversation_task_gr = this._getConversationTaskGr(result.callingCsConversationTask);
            result.fdihUniqueKey = VATranscriptBuilderConstants.NEW_LINE_CHARACTER + result.type + " invoked - " + result.name + " at " + result.sentOn + " ";

            fdihInvocations[invocation.lastMessageId] = result;
        }
        this.fdihIvocations = fdihInvocations;
    },

  getTranscript: function() {
    this.addConversationDetails();
    this.addMessages();

    var prettyTranscript =
        JSON.stringify(this.transcript, null, "\t")
        .replace(/["]+/g, '') // Remove Quotes from Key value pairs
        .split(" : ").join(" ") // Remove the colons between key value pairs
        .split(VATranscriptBuilderConstants.NEW_LINE_CHARACTER).join("\n") // Replace unique identifier with newline character
        .replace(/,/g, ''); // Remove comma at the end of each key value pair

    return prettyTranscript;
},

    type: 'VAChatTranscriptBuilder'
};
