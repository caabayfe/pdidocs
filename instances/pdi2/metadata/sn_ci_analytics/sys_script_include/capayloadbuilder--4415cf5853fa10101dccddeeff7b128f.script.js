var CAPayloadBuilder = Class.create();

CAPayloadBuilder.prototype = {
    INTENT_AUTO_SELECTED: 'Auto-Select',
    INTENT_CORRECT: 'Correct',
    INTENT_INCORRECT: 'Incorrect',
    INTENT_UNSUPPORT: 'Unsupport',
    NO_DEFLECTION: '10',

    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger("CAPayloadBuilder");
        this.util = new CAUtil();
        this.parPayloadBuilder = new CAPARPayloadBuilder();
    },

    getConversation: function() {
        return this.conversation;
    },

    getSharedData: function() {
        return this.sharedData || {};
    },

    _setCommonConversationData: function(interactionGr, conversationGr) {
        this.conversationStartTimeInMillis = new GlideDateTime(conversationGr.sys_created_on).getNumericValue();
        this.conversationEndState = this.conversation['DynamicProperties']['End State'];
        this.conversationChannel = this._valueCheck(conversationGr.device_type.getDisplayValue());
        this.liveAgentTranferFlag = !gs.nil(conversationGr.live_agent_transfer_time);
        this.conversationType = this._valueCheck(conversationGr.conversation_type);
        this.sharedData['conversation_end_state'] = this.conversationEndState;
        this.sharedData['conversation_startTime_mills'] = this.conversationStartTimeInMillis;
        this._logDebug('Conversation Duration: {1}', [this.conversationStartTimeInMillis]);
    },

    _setCommonTopicData: function(topicGr) {
        this.topicName = this._valueCheck(topicGr.topic_type.sys_id);
        this.topicDescription = this._valueCheck(topicGr.topic_type.name);
    },

    _getConversationDuration: function(conversationGr) {
        if (!this.conversation['Duration']) {
            var startTime = new GlideDateTime(conversationGr.sys_created_on);
            var completedTime = conversationGr.conversation_completed ? new GlideDateTime(conversationGr.conversation_completed) : new GlideDateTime(conversationGr.sys_updated_on);
            return GlideDateTime.subtract(startTime, completedTime).getNumericValue();
        }

        return this.conversation['Duration'];
    },

    _getLAAndVADuration: function(conversationGr) {
        var vaTime = 0;
        var laTime = 0;
        var live_agent_transfer_time = conversationGr.live_agent_transfer_time;
        var startTime = new GlideDateTime(conversationGr.sys_created_on);
        var completedTime = conversationGr.conversation_completed ? new GlideDateTime(conversationGr.conversation_completed) : new GlideDateTime(conversationGr.sys_updated_on);
        var duration = GlideDateTime.subtract(startTime, completedTime).getNumericValue();
        if (live_agent_transfer_time && live_agent_transfer_time != '') {
            live_agent_transfer_time = new GlideDateTime(conversationGr.live_agent_transfer_time);
            vaTime = GlideDateTime.subtract(startTime, live_agent_transfer_time).getNumericValue();
            laTime = GlideDateTime.subtract(live_agent_transfer_time, completedTime).getNumericValue();
        } else {
            vaTime = duration;
            laTime = 0;
        }
        if (!this.conversation['DynamicProperties']['VA Chat Duration'] || '' == this.conversation['DynamicProperties']['VA Chat Duration']) {
            this.conversation['DynamicProperties']['VA Chat Duration'] = vaTime;
        }
        if (!this.conversation['DynamicProperties']['Live Agent Chat Duration'] || '' == this.conversation['DynamicProperties']['Live Agent Chat Duration']) {
            this.conversation['DynamicProperties']['Live Agent Chat Duration'] = laTime;
        }
    },

    _setLAAbandonedDurationFromUser: function(caConversation, interactionGr) {
        var state = interactionGr.getValue('state');
        var reason = interactionGr.getValue('state_reason');
        var isLAChat = interactionGr.getValue('agent_chat');
        if (state == 'closed_abandoned' && reason == 'left_before_engagement' && isLAChat) {
            var task = this.queryConversationTask(caConversation.getValue('conversation'));
            while (task.next()) {
                var vaTransferTime;
                var closingTime;
                if (task.topic_type.name.includes('Closing Conversation')) {
                    closingTime = new GlideDateTime(task.sys_created_on).getNumericValue();
                }
                if (task.topic_type.name.includes('Live Agent Support')) {
                    vaTransferTime = new GlideDateTime(task.sys_created_on).getNumericValue();
                }
                if (vaTransferTime && closingTime) {
                    var userWaitingTime = closingTime - vaTransferTime;
                }
                this.conversation['DynamicProperties']['User Waiting Duration'] = userWaitingTime;
            }
        }
    },

    queryConversationTask: function(conversationId) {
        var conversationTask = new GlideRecord('sys_cs_conversation_task');
        conversationTask.addQuery('conversation', conversationId);
        conversationTask.addQuery('topic_type.is_system_topic', false);
        conversationTask.orderBy('sys_created_on');
        conversationTask.query();
        return conversationTask;
    },

    _setLastVisitedNodeName: function(nodeName) {
        this.topicEvent['Properties']['Last Visited Node Name'] = this._valueCheck(nodeName);
    },

    _setLastNodeVisited: function(node) {
        this.topicEvent['Properties']['Last Node Visited'] = node['type'] == 'TerminateGoal';
    },

    _getConversationType: function(conversationGr, interactionGr) {
        var live_agent_transfer_time = conversationGr.live_agent_transfer_time;
        var virtual_agent = interactionGr.getValue('virtual_agent');
        var liveAgentTransferTimeEmpty = gs.nil(live_agent_transfer_time);
        if (liveAgentTransferTimeEmpty && virtual_agent == true)
            return 'VA Only';
        else if (!liveAgentTransferTimeEmpty && virtual_agent == true)
            return 'VA to LA';
        else if (!liveAgentTransferTimeEmpty && virtual_agent == false)
            return 'LA Only';
        else
            return 'Never Engaged';
    },

    initConversation: function(conversationId) {
        this.conversation = {
            'DynamicProperties': {},
            'Screens': [],
            'Events': [],
            'User': {}
        };
        this.sharedData = {};
        this.predictions = {
            CORRECT: [],
            INCORRECT: [],
            AUTOSELECTED: [],
            UNSUPPORTED: [],
        };
        this.intents = [];
        this.conversationId = conversationId;
    },

    buildConversation: function(caConversation, interactionGr, conversationGr) {

        this.conversation['Id'] = this._valueCheck(conversationGr.sys_id);
        this._setCommonConversationData(interactionGr, conversationGr);

        var gd = new GlideDate();
        gd.setValue(conversationGr.sys_created_on.toString());
        this.conversation['StartTime'] = gd.getByFormat("yyyy-MM-dd'T'HH:mm:ss.SS").toString();
        this._logDebug('Conversation start time: {1}, Converted start time: {2}', [conversationGr.sys_created_on.toString(), this.conversation['StartTime']]);
        this.conversation['Locale'] = this._valueCheck(interactionGr.getValue('user_language'));
        this.conversation['Duration'] = this._getConversationDuration(conversationGr);
        this._getLAAndVADuration(conversationGr);
        this._setLAAbandonedDurationFromUser(caConversation, interactionGr);
        this.conversation['DynamicProperties']['Channel Name'] = this.conversationChannel;
        var providerApplicationGr = new GlideRecord('sys_cs_provider_application');
        providerApplicationGr.get(interactionGr.provider_application);
        var providerGr = new GlideRecord('sys_cs_provider');
        providerGr.get(providerApplicationGr.provider);
        this.conversation['DynamicProperties']['Provider Name'] = this._valueCheck(
            interactionGr.provider_application && providerApplicationGr.provider && providerGr.name ? providerGr.name : ''
        );
        this.conversation['DynamicProperties']['Provider Identifier'] = this._valueCheck(
            interactionGr.provider_application && providerApplicationGr.name ? providerApplicationGr.name : ''
        );
        this.conversation['DynamicProperties']['Conversation Type'] = this._getConversationType(conversationGr, interactionGr);
        this.conversation['DynamicProperties']['Initiated By'] = this.conversationType;
        this.conversation['DynamicProperties']['Language Translated'] = interactionGr.translated == true;
        this.conversation['DynamicProperties']['Agent Language Translated'] = (interactionGr.translated == true) && (interactionGr.agent_chat == true);
        this.conversation['DynamicProperties']['Multiple Predictions'] = 0;
        this.conversation['DynamicProperties']['Interaction Type'] = interactionGr.getValue('type');
        this.conversation['DynamicProperties']['Interaction Subtype'] = interactionGr.getValue('subtype');
        this.conversation['DynamicProperties']['Deflections'] = 0;
        this.conversation['DynamicProperties']['AI Search'] = false;
        this.conversation['DynamicProperties']['KB Shared'] = 0;
        this.updateInterfaceInformation(interactionGr);
    },

    updateInterfaceInformation: function(interactionGr) {
        var type = interactionGr.getValue('type').toLowerCase();
        this.conversation['DynamicProperties']['Interface'] = type.charAt(0).toUpperCase() + type.slice(1);
        if (interactionGr.getValue('subtype') === 'mweb' && interactionGr.getValue('type') === 'chat') {
            var context = new GlideRecord('interaction_context');
            context.addQuery('interaction', interactionGr.getUniqueValue());
            context.addQuery('name', 'liveagent_portal');
            context.query();
            if (context.next()) {
                this.conversation['DynamicProperties']['Interface-Type'] = 'Service Portal';
                this.conversation['DynamicProperties']['Interface-Name'] = context.getValue('value');
            } else {
                this.conversation['DynamicProperties']['Interface-Type'] = 'Unknown';
            }
        } else {
            this.conversation['DynamicProperties']['Interface-Type'] = 'Chat Integrations';
            this.conversation['DynamicProperties']['Interface-Name'] = interactionGr.getValue('subtype');
        }
    },

    updateMutiplePredictionsCount: function() {
        this.conversation['DynamicProperties']['Multiple Predictions']++;
    },

    setAISearchInvokedStatus: function() {
        this.conversation['DynamicProperties']['AI Search'] = true;
    },

    updateDeflectionCount: function(taskIds) {
        var gr = new GlideAggregate('ssa_deflection_metric');
        gr.addQuery('content_table', 'sys_cs_conversation_task');
        gr.addQuery('content_id', 'IN', taskIds);
        gr.addQuery('type', '!=', this.NO_DEFLECTION);
        gr.addAggregate('COUNT');
        gr.query();
        gr.next();
        var count = gr.getAggregate('COUNT');
        this.conversation['DynamicProperties']['Deflections'] = count;
    },

    updateSharedKBCount: function(eventName) {
        this.conversation['DynamicProperties']['KB Shared']++;
    },

    // Users

    addUser: function(conversationGr, consumerGr) {
        this._buildUser(conversationGr, consumerGr);
        this.conversation['User'] = this.user;
    },

    _isGuestUser: function(userId) {
        var gr = new GlideRecord('sys_user');
        return !gr.get(userId);
    },

    getHashedUserId: function(user) {
        var hashedUserId = null;
        var userGr = new GlideRecord('sys_user');
        userGr.addQuery('sys_id', user);
        userGr.query();
        if (userGr.next()) {
            hashedUserId = userGr.getValue('hashed_user_id');
        }
        return hashedUserId;
    },

    _buildUser: function(conversationGr, consumerGr) {
        this.user = {
            'Properties': {}
        };

        var uniqueUser = null;
        var hashedUserId = null;
        var userId = !gs.nil(consumerGr) ? consumerGr.user_id : null;
        var isGuestUser = userId ? this._isGuestUser(userId) : true;
        if (!isGuestUser) {
            uniqueUser = userId;
            hashedUserId = this.getHashedUserId(userId);
        }
        this.user['UserId'] = (uniqueUser != null) ? ((hashedUserId != null) ? hashedUserId : this._getUserHash(uniqueUser)) : null;
        this.user['Properties']['Domain Id'] = this._valueCheck(conversationGr.sys_domain);
    },


    _getUserHash: function(user) {
        var userId = this._valueCheck(new GlideDigest().getSHA256Hex(user));
        return userId ? userId.toLowerCase() : null;
    },

    // Screens

    addTopicScreen: function(taskGr) {
        this._buildTopicScreen(taskGr);
        this.conversation['Screens'].push(this.topicScreen);
    },

    _buildTopicScreen: function(taskGr) {
        this._setCommonTopicData(taskGr);
        this.topicScreen = {};
        this.topicScreen['Name'] = this.topicName;
        this.topicScreen['Description'] = this.topicDescription;
        this.topicScreen['Type'] = 'Topic';
        this.topicScreen['StartTime'] = this._getDuration(taskGr.sys_created_on);
    },

    _addTopicNodeScreen: function(topicNode) {
        this._buildTopicNodeScreen(topicNode);
        this.conversation['Screens'].push(this.topicNodeScreen);
        this._setLastVisitedNodeName(topicNode.name);
        this._setLastNodeVisited(topicNode);
    },

    _buildTopicNodeScreen: function(topicNode) {
        this.topicNodeScreen = {};
        this.topicNodeScreen['Name'] = this.topicName + '/' + topicNode.id;
        this.topicNodeScreen['Description'] = topicNode.name;
        this.topicNodeScreen['Type'] = 'TopicNode';
        this.topicNodeScreen['StartTime'] = this._getTopicNodeDuration(topicNode);
    },

    addTopic: function(taskGr, topicTypeGr) {
        this.addTopicScreen(taskGr);
        this.addTopicEvent(taskGr, topicTypeGr);
    },

    /**
     * @param {String} taskContextXml - contains the sys_cs_conversation_task context in XML format
     * @param {Number} nodeListIndex - index of NodeDetailsList in taskContextXml
     * 
     * @returns {String} CSV representation of nodes from NodeDetailsList.value element
     */
    _getNodesCsv: function(taskContextXml, nodeListIndex) {
        var nodeListXml = taskContextXml.substring(nodeListIndex);
        var valueStart = nodeListXml.indexOf('<value>');
        var valueEnd = nodeListXml.indexOf('</value>');
        var nodesCsv = nodeListXml.substring(valueStart + 7, valueEnd);
        return nodesCsv.replace(new RegExp('&#xd;', 'g'), '\r');
    },

    /**
     * Prerequisite: There would be always 4 headers present.
     * 		=> id
     * 		=> name
     * 		=> type
     * 		=> start_time
     * 
     * For an example as below in Nodes CSV Information
     * 
     * id,								 name,					type,				start_time
     * bfd9ca3b74264a68a0b8543159566d20, Start,                 StartGoal,			1719563225898
     * 60cdf6a874894c84841d99a073fbba0b, Decision,              Decision,			1719563225899
     * 6bd621fcf54841abb81d20cde33081bb, Decision,              Decision,			1719563225902
     * d9f84b23b3dc4d9891ddac278259decb, Get Greeting Message,  ScriptedAction,		1719563225904
     * d2327c9f0cb74a2983f695746d52d0f2, Show Greeting Message, OutputPrompt,		1719563225908
     * 3b0fa5a45fa94052bd1b546ea1f7303b, Send Topic Picker,     ScriptedAction,		1719563226091
     * 
     * 
     * The header information we receive from 
     * 		com.glide.cs.qlue.module.taco.NodeLoggingServiceImpl#getNodeDetailsCsvHeader
     * 
     * Node details CSV constructed inside 
     * 		com.glide.cs.qlue.module.taco.NodeLoggingServiceImpl#getNodeDetailsCsv
     * 
     * The entire Nodes CSV information is constructed here 
     * 		com.glide.cs.qlue.module.taco.NodeLoggingServiceImpl#addNodeDetailsToTaskContext
     * 
     * 
     * When there is a change in above logic, accordingly following logic has to be modified
     * 
     * 
     * Below function works as below
     * 
     * Step 1: NodeInfotmation split by , symbol
     * Step 2: Store index 0 value in result as result[headers[0]]
     * Step 3: Store concatinated values from 1st index to except last two values at result[headers[1]]
     * Step 4: Store last but one => values[values.length - 2] at result[headers[2]]
     * Steo 5: Store last one     => values[values.length - 1] at result[headers[3]]
     * 
     * 
     * @param {Array} headers
     * @param {String} nodeInfo - , separated node information 
     * @returns {Map} - Example as 
     * 					{
     * 						"id": "bfd9ca3b74264a68a0b8543159566d20",
     *  					"name": "Start",
     *  					"type": "StartGoal",
     *  					"start_time": 1719563225898						
     * 					}
     */
    _constructNode: function(headers, nodeInfo) {
        var result = {};
        var values = nodeInfo.split(',');

        // Assign the first value to the 'id' key
        result[headers[0]] = values[0];

        /**
         * Concatenate the middle values with a comma and assign to the 'name' key
         * This join would helps us when name contains the comma symbols for example 
         * 60cdf6a874894c84841d99a073fbba0b, name,containg,the,comma,symbols,              Decision,			1719563225899
         * 
         * When we split the entire row by , var values = nodeInfo.split(',');
         * The above line would return more than 4 values. 
         * To solve the problem we are joining back the name column data  ==> values.slice(1, values.length - 2).join(',')
         */
        result[headers[1]] = values.slice(1, values.length - 2).join(',');

        // Assign the last two values to the 'type' and 'start_time' keys
        result[headers[2]] = values[values.length - 2];
        result[headers[3]] = values[values.length - 1];

        return result;
    },

    /**
     * @param {String} taskContextXml - contains the sys_cs_conversation_task context in XML format
     * @returns {Array} an array of Node Objects
     */
    _constructNodes: function(taskContext, taskContextType) {
        var nodesCsv;
        if (taskContextType == 'XML') {
            var nodeListIndex = taskContext.indexOf('NodeDetailsList');
            if (nodeListIndex > -1) {
                // Get Nodes CSV information
                nodesCsv = this._getNodesCsv(taskContext, nodeListIndex);
            }
        } else {
            var jsonData = JSON.parse(taskContext);
            if (jsonData && jsonData.values && jsonData.values.NodeDetailsList && jsonData.values.NodeDetailsList.value)
                nodesCsv = jsonData.values.NodeDetailsList.value;
        }

        var nodes = [];
        if (nodesCsv) {
            var nodesInfo = nodesCsv.trim().split(new RegExp('\\r?\\n', 'g'));

            // 4 header values => id, name, type, start_time
            var headers = nodesInfo[0].split(',');

            if (this.logger.isDebugEnabled())
                this._logDebug('Parsed nodes: {1}', new global.JSON().encode(nodesInfo));

            for (var i = 1; i < nodesInfo.length; i++) {
                /**
                 * {
                 * 	"id": "bfd9ca3b74264a68a0b8543159566d20",
                 * 	"name": "Start",
                 * 	"type": "StartGoal",
                 * 	"start_time": 1719563225898
                 * }
                 */
                var nodeObj = this._constructNode(headers, nodesInfo[i]);
                nodes.push(nodeObj);
            }
        }

        return nodes;
    },

    addTopicNodes: function(taskGr, topicTypeGr) {
        var taskContext = taskGr.getValue("context").substring(16);
        taskContext = new global.VAGlobalUtil().getDecompressedValue(taskContext);
        this._logDebug('Conversation taskId: {1}, Context: {2}', [taskGr.getValue('sys_id'), taskContext]);
        // Returns either JSON or XML as the context format
        var taskContextType = taskGr.conversation.context_format ? taskGr.conversation.context_format : 'XML';

        var nodes = this._constructNodes(taskContext, taskContextType);

        for (var k = 0; k < nodes.length; k++) {
            var node = nodes[k];
            this._addTopicNodeEvent(node, taskGr);
            this._addTopicNodeScreen(node);
        }

        this._addTopicCategoryEvents(taskGr);
        this._recordTopicCompletionMetrics(taskGr);
        this.topicEvent['par_payload'] = this.parPayloadBuilder.getTopicPayload(this.topicEvent, taskGr, topicTypeGr);
    },

    /*
     * Method to collect topic completion information using GCF.
     */
    _recordTopicCompletionMetrics: function(taskGr) {
        try {
            var sm = new GCFSampleMap();
            sm.put('topic', taskGr.topic_type.name);
            sm.put('device_type', taskGr.conversation.device_type);
            sm.put('completed', this.topicEvent['Properties']['Last Node Visited']);
            var topicGr = new GlideRecord('sys_cb_topic');
            if (topicGr.get(taskGr.topic_type.cb_topic_id)) {
                if (topicGr.getValue('sys_policy') == 'read' && topicGr.getValue('source_topic_id') == null) {
                    sm.put('type', 'oob');
                } else {
                    sm.put('type', 'custom');
                }
            }
            GCFCollector.recordUsageEvent('conversational_analytics', 'virtual_agent', 'topic_completion', sm);
        } catch (err) {
            var message = "Metric collection for topic completion failed: " + err.message;
            this.logger.error(message);
        }
    },

    //Events

    addTopicEvent: function(topicGr, topicTypeGr) {
        this._buildTopicEvent(topicGr, topicTypeGr);
        this.conversation['Events'].push(this.topicEvent);
    },

    _addTopicNodeEvent: function(node, taskGr) {
        this._buildTopicNodeEvent(node, taskGr);
    },

    _buildTopicNodeEvent: function(node, taskGr) {
        // Only for Static Choice and Boolean nodes

        // Check if an event was already created for this node
        var topicNodeEventCreated = this.conversation['Events'].filter(function(event) {
            return event['Type'] === 'Topic Node' && event['Properties']['Topic Node Id'] === node.id;
        }).pop();

        if (topicNodeEventCreated) return;

        var nodeValues = this._getSelectedValuesForNode(node, taskGr);
        var self = this;

        nodeValues.forEach(function(nodeVal) {
            var topicNodeEvent = {
                'Properties': {}
            };
            topicNodeEvent['Name'] = self._valueCheck(node.name);
            topicNodeEvent['Time'] = self._getDuration(nodeVal.time);
            topicNodeEvent['Type'] = 'Topic Node';
            topicNodeEvent['Properties']['Topic Id'] = taskGr.topic_type.sys_id + '';
            topicNodeEvent['Properties']['Topic Name'] = taskGr.topic_type.name + '';
            topicNodeEvent['Properties']['Topic Node Id'] = node.id;
            topicNodeEvent['Properties']['Type'] = nodeVal.type; // 'choice' | 'boolean'
            topicNodeEvent['Properties']['Selected Value'] = nodeVal.value;

            self.conversation['Events'].push(topicNodeEvent);
        });
    },

    // Only returns values for Static and Boolean type nodes, else []
    _getSelectedValuesForNode: function(node, taskGr) {
        var selectedValuesForNode = [];

        // try-catch the whole flow since we're parsing the sys_cb_topic graph JSON, and it could change in future
        try {
            // Find out the type of the topic node from the "sys_cb_topic" record
            var cbTopic = new GlideRecord('sys_cb_topic');
            if (!cbTopic.get(taskGr.topic_type.cb_topic_id))
                return selectedValuesForNode;
            var graph;

            try {
                graph = JSON.parse(cbTopic.getValue('graph'));
            } catch (e) {
                this._logDebug('Error parsing sys_cb_topic graph: {}', e.toString());
                return selectedValuesForNode;
            }

            // get the first "goal" of the graph, and then it's "nodes"
            var goalId = Object.keys(graph.goals)[0]; // either "primary", or some UUID for older topics
            if (!goalId) {
                this._logDebug('No goal found in the sys_cb_topic graph');
                return selectedValuesForNode;
            }
            var nodes = graph.goals[goalId].nodes || [];
            var currentNode = nodes[node.id];

            if (currentNode && currentNode.variableId) {
                var nodeType = graph.variables[currentNode.variableId].varType;
                var nodeVarName = graph.variables[currentNode.variableId].name;
                var nodeLabel = graph.variables[currentNode.variableId].label;

                if (nodeType === 'boolean' || nodeType === 'choice') {

                    // Get the runtime messages that were user's inputs for these nodes
                    var messagesGr = new GlideRecord('sys_cs_message');
                    messagesGr.addQuery('task', taskGr.getValue('sys_id'));
                    messagesGr.addQuery('direction', 'inbound');
                    messagesGr.query();

                    while (messagesGr.next()) {
                        try {
                            var nodePayload = JSON.parse(messagesGr.getValue('payload'));
                            var nodeUiType = nodePayload.uiType; // Boolean and Picker
                            if (!nodeUiType)
                                continue;

                            if (
                                (nodePayload.model && nodePayload.model.name === nodeVarName)
                                // ensure we're picking the right message(s) for the current node
                                &&
                                (
                                    (nodeUiType === 'Picker' && nodeType === 'choice') || // sys_cs_message and graph node uses different values ('Picker' vs 'choice')
                                    (nodeUiType === 'Boolean' && nodeType === 'boolean') // sys_cs_message and graph node uses different values ('Boolean' vs 'boolean')
                                )
                            ) {
                                // we found a run-time message for this node, now get the user's input value for this input node
                                selectedValuesForNode.push({
                                    type: nodeType,
                                    value: nodePayload.value,
                                    time: messagesGr.getValue('sys_created_on')
                                });
                            }
                        } catch (e) {
                            this._logDebug('Error extracting user input values for node from messages: {}', e.toString());
                        }
                    }
                }
            }
            return selectedValuesForNode;
        } catch (e) {
            this._logDebug('Error getting the selected values for the node', e.toString());
            return selectedValuesForNode;
        }
    },

    _buildTopicEvent: function(taskGr, topicTypeGr) {

        this.topicEvent = {
            'Properties': {}
        };
        this.topicEvent['Name'] = this._valueCheck(topicTypeGr.name);
        this.topicEvent['Time'] = this._getDuration(taskGr.sys_created_on);
        this.topicEvent['Type'] = 'Topic';
        this.topicEvent['Properties']['Topic Id'] = this._valueCheck(topicTypeGr.sys_id);
        var subCategory = this._valueCheck(topicTypeGr.type);
        this.topicEvent['Properties']['Sub Category'] = subCategory;
        if (subCategory == 'SETUP_TOPIC')
            this.topicEvent['Properties']['Setup Topic Type'] = this._valueCheck(this._getSetupTopicType(taskGr.topic_type));
        else if (subCategory == 'TOPIC_BLOCK') {
            var conversationTaskGr = new GlideRecord('sys_cs_conversation_task');
            conversationTaskGr.get(taskGr.calling_task);
            var conversationTaskTopicTypeGr = new GlideRecord('sys_cs_topic');
            conversationTaskTopicTypeGr.get(conversationTaskGr.topic_type);
            this.topicEvent['Properties']['Parent Topic Name'] = this._valueCheck(conversationTaskTopicTypeGr.name);
            this.topicEvent['Properties']['Parent Topic Id'] = this._valueCheck(conversationTaskTopicTypeGr.sys_id);
        }
        this.topicEvent['Properties']['Channel Name'] = this.conversationChannel;
        this.topicEvent['Properties']['End State'] = this.conversationEndState;
        this.topicEvent['Properties']['Live Agent Transfer'] = this.liveAgentTranferFlag;
        this.topicEvent['Properties']['NLU Intent'] = this._getNluIntent(this.topicEvent['Properties']['Topic Id']);
        this.topicEvent['Properties']['Application'] = this._valueCheck(topicTypeGr.sys_scope.getDisplayValue("sys_scope"));
        this.topicEvent['Properties']['Category'] = this._valueCheck(topicTypeGr.design_category.getDisplayValue("design_category"));

    },

    _getNluIntent: function(topicId) {
        var arrayUtil = new global.ArrayUtil();
        if (arrayUtil.indexOf(this.predictions.AUTOSELECTED, topicId) > -1)
            return this.INTENT_AUTO_SELECTED;

        if (arrayUtil.indexOf(this.predictions.CORRECT, topicId) > -1)
            return this.INTENT_CORRECT;

        if (arrayUtil.indexOf(this.predictions.INCORRECT, topicId) > -1)
            return this.INTENT_INCORRECT;
    },

    _getSetupTopicType: function(topicName) {
        var gr = new GlideRecord('sys_cs_context_profile_topic');
        gr.addQuery('topic', topicName);
        gr.query();
        gr.next();
        return gr.getDisplayValue('topic_type');
    },

    _addTopicCategoryEvents: function(taskGr) {
        var topicCategoryIds = taskGr.topic_type.design_category;
        var topicCategoryGr = new GlideRecord('sys_cb_topic_category');
        topicCategoryGr.addEncodedQuery('sys_idIN' + topicCategoryIds);
        topicCategoryGr.query();
        while (topicCategoryGr.next()) {
            this._buildTopicCategoryEvent(topicCategoryGr, taskGr);
            this.conversation['Events'].push(this.topicCategoryEvent);
        }
    },

    _buildTopicCategoryEvent: function(topicCategoryGr, taskGr) {
        this.topicCategoryEvent = {
            'Properties': {}
        };
        var name = this._valueCheck(topicCategoryGr.name);
        this.topicCategoryEvent['Name'] = name;
        this.topicCategoryEvent['Time'] = this._getDuration(taskGr.sys_created_on);
        this.topicCategoryEvent['Type'] = 'Topic Category';
        this.topicCategoryEvent['Properties']['Topic Id'] = this._valueCheck(taskGr.topic_type.sys_id);
        this.topicCategoryEvent['Properties']['Topic Name'] = this._valueCheck(taskGr.topic_type.name);
        this.topicCategoryEvent['Properties']['End State'] = this.conversationEndState;
        this.topicCategoryEvent['Properties']['Live Agent Transfer'] = this.liveAgentTranferFlag;
        this.topicCategoryEvent['Properties']['Channel Name'] = this.conversationChannel;
        this.topicCategoryEvent['Properties']['Last Node Visited'] = this.topicEvent && this.topicEvent['Properties'] && this.topicEvent['Properties']['Last Node Visited'];
        this.topicCategoryEvent['par_payload'] = this.parPayloadBuilder.getTopicCategoryPayload(this.topicCategoryEvent, topicCategoryGr, taskGr);
    },

    buildIntentEvent: function(intentFeedBackGr, intentGr, topicLangGr) {

        var auditLogGr = new GlideRecord('open_nlu_predict_log');
        auditLogGr.get(intentFeedBackGr.audit_log);
        var topicGr = new GlideRecord('sys_cs_topic');
        topicGr.get(topicLangGr.cs_topic_id);

        this.intentEvent = {
            'Properties': {}
        };
        var predictionType = this._getPredictionType(intentFeedBackGr);
        this.intentEvent['Name'] = this.getIntentName(predictionType);

        var auditCompletedTime = intentFeedBackGr.audit_log && auditLogGr.completed;
        this.intentEvent['Time'] = this._getDuration(auditCompletedTime);
        this.intentEvent['Type'] = 'Intent';
        this.intentEvent['Properties']['Id'] = this._valueCheck(intentGr.getValue('sys_id'));
        this.intentEvent['Properties']['Selected'] = this._getIntentStatus(intentFeedBackGr).toString();
        this.intentEvent['Properties']['Topic Id'] = topicLangGr.cs_topic_id && this._valueCheck(topicGr.sys_id);
        this.intentEvent['Properties']['Topic Name'] = topicLangGr.cs_topic_id && this._valueCheck(topicGr.name);
        this.intentEvent['Properties']['Duration'] = auditLogGr.duration.toString();
        this.intentEvent['Properties']['NLU Provider'] = intentFeedBackGr.getDisplayValue('nlu_provider');
        this.intentEvent['par_payload'] = this.parPayloadBuilder.getIntentPayload(this.intentEvent, topicGr, intentGr, intentFeedBackGr);
        this._addToPredictions(predictionType, this.intentEvent['Properties']['Topic Id']);
        return this.intentEvent;
    },

    addIntentsToConversation: function(nluIntents) {
        this.conversation['Events'].push.apply(this.conversation['Events'], nluIntents);
    },

    _getIntentStatus: function(intentFeedBackGr) {
        return this.util.getBooleanValue(intentFeedBackGr.getValue('selected'));
    },

    getIntentName: function(type) {
        var name;
        if (type == this.INTENT_AUTO_SELECTED)
            name = 'Intent Auto Selected';
        else if (type == this.INTENT_CORRECT)
            name = 'Intent Correctly Detected';
        else if (type == this.INTENT_INCORRECT)
            name = 'Intent Incorrectly Detected';
        else if (type == this.INTENT_UNSUPPORT)
            name = 'Intent Unsupported';
        return name;
    },

    _addToPredictions: function(predictionType, topicId) {
        if (!predictionType || !topicId)
            return;
        if (predictionType == this.INTENT_AUTO_SELECTED)
            this.predictions.AUTOSELECTED.push(topicId);
        else if (predictionType == this.INTENT_CORRECT)
            this.predictions.CORRECT.push(topicId);
        else if (predictionType == this.INTENT_INCORRECT)
            this.predictions.INCORRECT.push(topicId);
    },

    _getPredictionType: function(intentFeedBackGr) {
        var shown = this.util.getBooleanValue(intentFeedBackGr.getValue('shown'));
        var selected = this.util.getBooleanValue(intentFeedBackGr.getValue('selected'));
        var autoSelected = this.util.getBooleanValue(intentFeedBackGr.getValue('auto_selected'));
        var prediction = intentFeedBackGr.getValue('prediction');
        if (!prediction || !prediction.length)
            return this.INTENT_UNSUPPORT;
        if (autoSelected)
            return this.INTENT_AUTO_SELECTED;
        if (selected)
            return this.INTENT_CORRECT;
        if (shown)
            return this.INTENT_INCORRECT;
    },

    preProcessCustomEvent: function(eventGr) {
        this.event = {
            'id': eventGr.getValue('sys_id'),
            'custom_name': eventGr.getValue('custom_name'),
            'custom_type': eventGr.getValue('custom_type'),
            'apply_post_fetch_filter': eventGr.getValue('apply_post_fetch_filter'),
            'event_time': eventGr.getValue('event_time'),
            'event_time_field': eventGr.getValue('event_time_field'),
            'propIds': []
        };
    },

    addCustomEvent: function(sourceGr, eventGr) {
        var customChatEvent = this._buildCustomEvent(sourceGr, eventGr);
        if (customChatEvent)
            this.conversation['Events'].push(customChatEvent);
    },

    _buildCustomEvent: function(sourceGr, eventGr) {
        if (!this._isCustomEventValid(sourceGr, eventGr)) {
            this._logDebug('Event ignored because post_fetch_filter script filters all data', []);
            return;
        }
        var customName = this._valueCheck(this._getCustomEventName(sourceGr, eventGr));
        if (!customName) {
            this._logDebug("Event ignored because event name is empty", []);
            return;
        }

        var customChatEvent = {
            'Properties': {},
            'par_payload': {}
        };
        customChatEvent['Name'] = customName;
        customChatEvent['Type'] = this._valueCheck(this._getCustomEventType(sourceGr, eventGr));
        customChatEvent['Time'] = this._getDuration(this._getEventTime(sourceGr, eventGr));
        customChatEvent['par_payload']['event_id'] = eventGr.getValue('sys_id');
        customChatEvent['par_payload']['created_on'] = sourceGr.getValue('sys_created_on');
        customChatEvent['par_payload']['event_props'] = [];
        var eventPropGr = new GlideRecord('sn_ci_analytics_event_prop');
        eventPropGr.addQuery('event', eventGr.getValue('sys_id'));
        eventPropGr.query();
        while (eventPropGr.next()) {
            var value;

            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('sourceGr', sourceGr);

            // this required as GlideScopedEvaluator.evaluateScript checks for isValidRecord()
            if (eventPropGr.advanced == 1)
                value = evaluator.evaluateScript(eventPropGr, "value_script", null);
            else {
                eventPropGr.field = 'sourceGr.' + eventPropGr.field;
                value = evaluator.evaluateScript(eventPropGr, "field", null);
            }
            customChatEvent['Properties'][eventPropGr.getValue('name')] = this._valueCheck(value);
            customChatEvent['par_payload']['event_props'].push({
                'prop_id': eventPropGr.getValue('sys_id'),
                'prop_name': eventPropGr.getValue('name'),
                'prop_value': this._valueCheck(value),
            });
        }

        return customChatEvent;
    },

    _getCustomEventName: function(sourceGr, eventGr) {
        var customNameFlag = this.util.getBooleanValue(this.event.custom_name);

        if (customNameFlag) {
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('sourceGr', sourceGr);
            return evaluator.evaluateScript(eventGr, 'custom_name_script', null);
        } else
            return eventGr.getValue('name');
    },

    _getCustomEventType: function(sourceGr, eventGr) {
        var customTypeFlag = this.util.getBooleanValue(this.event.custom_type);

        if (customTypeFlag) {
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('sourceGr', sourceGr);
            var res = evaluator.evaluateScript(eventGr, 'custom_type_script', null);
            if (!res)
                return 'Custom';
            else
                return res;
        } else
            return eventGr.getValue('type');
    },

    _isCustomEventValid: function(sourceGr, eventGr) {
        var postFetchFilterApplied = this.util.getBooleanValue(this.event.apply_post_fetch_filter);
        if (!postFetchFilterApplied)
            return true;
        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('sourceGr', sourceGr);
        return evaluator.evaluateScript(eventGr, 'post_fetch_filter', null);
    },

    _getEventTime: function(sourceGr, eventGr) {
        var eventTime = sourceGr.getValue('sys_created_on');
        var eventTimeConfigured = this.util.getBooleanValue(this.event.event_time);
        if (eventTimeConfigured) {
            var evaluator = new GlideScopedEvaluator();
            evaluator.putVariable('sourceGr', sourceGr);
            var oldValue = eventGr.event_time_field.toString();
            eventGr.event_time_field = 'sourceGr.' + oldValue;
            eventTime = evaluator.evaluateScript(eventGr, "event_time_field", null);
            eventGr.event_time_field = oldValue; // reset to oldvalue as eventGr used multiple times
        }
        return eventTime;
    },

    _getTopicNodeDuration: function(topicNode) {
        var nodeDuration = topicNode.start_time - this.conversationStartTimeInMillis;
        if (nodeDuration > this.conversation['Duration'])
            return this.conversation['Duration'];
        return nodeDuration;
    },

    _getDuration: function(createdDate) {
        return createdDate ? new GlideDateTime(createdDate).getNumericValue() - this.conversationStartTimeInMillis : 0;
    },

    // call this to make sure we don't send '' or null to appsee
    _valueCheck: function(value) {
        if (gs.nil(value))
            return undefined;
        return value.toString();
    },

    processOverride: function(overrideGr, conversationId) {
        var key = overrideGr.getValue('key');
        var value;
        var convGr = new GlideRecord('sys_cs_conversation');
        convGr.get(conversationId);

        var evaluator = new GlideScopedEvaluator();
        evaluator.putVariable('convGr', convGr);

        if (overrideGr.advanced == 1)
            value = evaluator.evaluateScript(overrideGr, "value_script", null);
        else {
            overrideGr.value_field = 'convGr.' + overrideGr.value_field;
            value = evaluator.evaluateScript(overrideGr, "value_field", null);
        }
        value = gs.nil(value) ? undefined : value;
        this._logDebug('Override Property {1} value {2}', [key, value]);
        var type = overrideGr.getValue('type');
        if (type == 'attribute')
            this.conversation[key] = (typeof value == 'object') ? value.toString() : value;
        else if (type == 'dynamicproperty')
            if (typeof value == 'object') {
                for (var item in value) {
                    this.conversation['DynamicProperties'][item] = value[item];
                }
            }
        else {
            this.conversation['DynamicProperties'][key] = value;
        }

    },

    // appends the default template msg.
    _logDebug: function(msg_template, params) {
        if (this.logger.isDebugEnabled()) {
            var arrayUtil = new global.ArrayUtil();
            var defaultParams = [this.conversationId];
            var argParams = arrayUtil.convertArray(params);
            var mergedArray = arrayUtil.union(defaultParams, argParams);
            msg_temp = "Conversation:{0}, " + msg_template;
            this.logger.debug(msg_temp, mergedArray);
        }

    },

    type: 'CAPayloadBuilder'
};
