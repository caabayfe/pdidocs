var NacmOpenPromptUtils = Class.create();
NacmOpenPromptUtils.prototype = {
    initialize: function() {
        this.logger = new sn_wwna.WWNALogger();
    },
    fetchDataThroughGraph: function(userQuery, schemaName) {
        try {
            const KNOWLEDGE_GRAPH_CAPABILITY_ID = sn_wwna.WWNAConstants.KNOWLEDGE_GRAPH_CAPABILITY_ID;
            var payloadForKnowledgeGraph = {
                "name": "0",
                "description": userQuery,
                "schemaName": schemaName
            };

            var knowledgeGraphRequest = {
                "executionRequests": [{
                    "payload": payloadForKnowledgeGraph,
                    "capabilityId": KNOWLEDGE_GRAPH_CAPABILITY_ID
                }],
                "mode": "sync",
            };

            var knowledgeGraphResponse = sn_one_extend.OneExtendUtil.executeSecure(knowledgeGraphRequest);
            var knowledgeGraphOutput = knowledgeGraphResponse.capabilities[KNOWLEDGE_GRAPH_CAPABILITY_ID].response ? JSON.parse(knowledgeGraphResponse.capabilities[KNOWLEDGE_GRAPH_CAPABILITY_ID].response) : {};
            knowledgeGraphResponse.capabilities[KNOWLEDGE_GRAPH_CAPABILITY_ID].response = knowledgeGraphOutput['0'] || [];
            return knowledgeGraphResponse;
        } catch (err) {
            this.logger.error("WWNA: Failed to fetch Knowledge Graph Data: " + err.message);
            return {
                "response": [],
                "status": "error",
                "errorType": "error",
                "errorMessage": sn_wwna.WWNAConstants.WWNAConstants.GENERIC_ERROR_MESSAGE
            };
        }
    },
    fetchKnowledgeGraph: function() {
        try {
            var gr = new GlideRecord('sys_meta_graph');
            gr.addActiveQuery();
            gr.query();
            var knowledgeGraphs = [];
            var tempObj;
            var tempSchema;
            while (gr.next()) {
                tempObj = {};
                tempObj.id = gr.sys_package.source + '.' + gr.getValue('name');
                tempObj.description = gr.getValue('description');
                tempObj.supportedTables = [];
                tempSchema = gr.getValue('schema_json');
                if (typeof tempSchema === 'string') {
                    tempSchema = JSON.parse(tempSchema);
                }
                tempSchema?.nodes?.forEach(function(nodeObj) {
                    tempObj.supportedTables.push(nodeObj.label);
                });
                knowledgeGraphs.push(tempObj);
            }
            return knowledgeGraphs;
        } catch (err) {
            this.logger.error("WWNA: Failed to fetch list of Knowledge Graphs: " + err.message);
            return [];
        }
    },
    fetchNAcmActions: function(table, actionTypes = []) {
        try {
            var actions = [];
            var utils = new sn_wwna.WWNAUtils();
            var actionGr = new GlideRecord(sn_wwna.WWNAConstants.TABLES.WWNA_QUICK_ACTIONS);
            const WWNA_ACTION_TYPE = sn_wwna.WWNAConstants.WWNA_ACTION_TYPES;
            let tablesToFetch = utils._getRootTableFromHierarchy(table, true);
            tablesToFetch.push(sn_wwna.WWNAConstants.WWNA_BASE_ACTION_TABLE);
            actionTypes = [...actionTypes, WWNA_ACTION_TYPE.COMMON, WWNA_ACTION_TYPE.OPEN_PROMPT_ACTION];
            actionGr.addActiveQuery();
            actionGr.addQuery('action_type', 'IN', actionTypes);
            actionGr.addQuery('table_name', 'IN', tablesToFetch);
            actionGr.addQuery('sys_id', '!=', sn_wwna.WWNAConstants.WWNA_OPEN_PROMPT_ACTION_ID);
            actionGr.addNotNullQuery('description');
            actionGr.query();
            while (actionGr.next()) {
                actions.push({
                    sysId: actionGr.getUniqueValue(),
                    commandName: actionGr.getValue('command_name'),
                    name: actionGr.getValue('name'),
                    description: actionGr.getValue('description'),
                    tableName: actionGr.getValue('table_name'),
                    actionType: actionGr.getValue('action_type'),
                    active: actionGr.getDisplayValue('active')
                });
            }
            return actions;
        } catch (err) {
            this.logger.error("WWNA: Failed to fetch list of actions: " + err.message);
            return [];
        }
    },
    preparePayloadForMultiAction: function(capabilityResponse = {}, payload = {}, actionsToBeAdded = [], actionsMap = {}, capabilityId) {
        try {
            const WWNA_KNOWLEDGE_GRAPH_ACTION_ID = sn_wwna.WWNAConstants.WWNA_KNOWLEDGE_GRAPH_ACTION_ID;
            actionsToBeAdded = actionsToBeAdded.map(({
                commandId,
                instruction
            }) => {
                let tempObj = actionsMap[commandId] || {
                    commandName: commandId,
                    tableName: payload.document_table_name
                };
                if (tempObj.sysId === WWNA_KNOWLEDGE_GRAPH_ACTION_ID) {
                    tempObj.knowledgeGraphId = payload.knowledge_graph_id;
                    tempObj.modifiedQueryForKnowledgeGraph = payload.modified_query_for_knowledge_graph;
                }
                tempObj.user_query = instruction;
                return tempObj;
            });
            let structureToBeAdded = {
                payload: payload,
                actionList: actionsToBeAdded
            };
            if (actionsToBeAdded.length) {
                structureToBeAdded.subState = sn_wwna.WWNAConstants.ONE_EXTEND_SUB_STATES.MULTI_ACTION;
            }
            let response = {};
            response.features = {};
            response.features[CAPABILITY_ID] = {
                result: Object.assign(JSON.parse(JSON.stringify(capabilityResponse)), structureToBeAdded)
            };
            response.features[CAPABILITY_ID].status = capabilityResponse.status;
            return response;
        } catch (err) {
            return {
                "status": "error",
                "errorType": "error",
                "errorMessage": "Unable to fetch the data. Please try again or contact the system administrator"
            };
        }
    },
    type: 'NacmOpenPromptUtils'
};
