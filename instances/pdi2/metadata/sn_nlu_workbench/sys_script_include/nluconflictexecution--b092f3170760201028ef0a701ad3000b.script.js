var NLUConflictExecution = Class.create();

(function() {
    var tables = NLUWorkbenchConstants.tables;
    var sysProps = NLUWorkbenchConstants.sysProps;
    var FIELDS = {
        DEFINITION: 'conflict_definition',
        SOLUTION: 'solution',
        MODELS_DATA: 'models_data',
        STATUS: 'status'
    };
    var processedMap = [];
    var REVIEWED_QUERY =
        'ignored=false^utterance_1.utteranceSAMEASoriginal_utterance_1^utterance_2.utteranceSAMEASoriginal_utterance_2';

    NLUConflictExecution.getLatestExecution = function(modelId) {
        var modelSnapshot = [];
        var gr = new GlideRecord(tables.NLU_CONFLICT_EXECUTION);
        gr.addQuery('conflict_definition.models', modelId);
        gr.addQuery('status', 'success');
        gr.orderByDesc('sys_created_on');
        gr.query();
        while (gr.next()) {
            var models = gr.conflict_definition.models.toString();
            if (models === modelId && NLUConflictExecution.isLatestExecution(modelId, gr))
                return gr;
        }
    };

    NLUConflictExecution.isLatestExecution = function(modelId, executionGr) {
        var modelStatus = global.NLUStudioService.getModelStatus(modelId);
        var lastTrainedTimestamp = !gs.nil(modelStatus) && !gs.nil(modelStatus.lastTrainedOn) ?
            new GlideDateTime(modelStatus.lastTrainedOn).getValue() : null;
        return executionGr.getValue('sys_created_on') >= lastTrainedTimestamp;
    };

    NLUConflictExecution.getConflictsCount = function(modelId, type) {
        var executionGr = NLUConflictExecution.getLatestExecution(GlideStringUtil.escapeQueryTermSeparator(modelId));
        if (!executionGr) throw new Error(gs.getMessage('NLU Conflict execution: No record exists for model {0)}', modelId));
        var executionId = executionGr.getUniqueValue();
        var intentsWithConflicts = [];
        var ga = new GlideAggregate(tables.NLU_CONFLICT_RESULT);
        ga.addAggregate('COUNT');
        ga.groupBy('intent_1');
        ga.groupBy('intent_2');
        var encodedQuery = 'conflict_execution=' + executionId + '^ignored=false^utterance_1.utteranceSAMEASoriginal_utterance_1^ORutterance_1.utteranceISEMPTY^utterance_2.utteranceSAMEASoriginal_utterance_2^ORutterance_2.utteranceISEMPTY';
        if (type) encodedQuery = encodedQuery + '^tag=' + GlideStringUtil.escapeQueryTermSeparator(type);
        ga.addEncodedQuery(encodedQuery, true);
        ga.query();
        while (ga.next()) {
            var intent1 = ga.getValue('intent_1').toString();
            var intent2 = ga.getValue('intent_2').toString();
            if (intentsWithConflicts.indexOf(intent1) === -1 && intent1) intentsWithConflicts.push(intent1);
            if (intentsWithConflicts.indexOf(intent2) === -1 && intent2) intentsWithConflicts.push(intent2);

        }
        return intentsWithConflicts.length;

    };

    NLUConflictExecution.getConflictsCountForIntent = function(intentId, type) {
        var intentGr = global.NLUIntent.getGRById(intentId);
        var modelId = intentGr.getValue('model');
        var executionGr = NLUConflictExecution.getLatestExecution(modelId);
        if (!executionGr) throw new Error(gs.getMessage('NLU Conflict execution: No record exists'));
        var executionId = executionGr.getUniqueValue();
        var count = 0;
        var ga = new GlideAggregate(tables.NLU_CONFLICT_RESULT);
        ga.addAggregate('COUNT');
        var encodedQuery = 'conflict_execution=' + executionId + '^ignored=false^utterance_1.utteranceSAMEASoriginal_utterance_1^ORutterance_1.utteranceISEMPTY^utterance_2.utteranceSAMEASoriginal_utterance_2^ORutterance_2.utteranceISEMPTY';
        if (type) encodedQuery = encodedQuery + '^tag=' + GlideStringUtil.escapeQueryTermSeparator(type);
        encodedQuery = encodedQuery + '^intent_1=' + GlideStringUtil.escapeQueryTermSeparator(intentId) + '^ORintent_2=' + GlideStringUtil.escapeQueryTermSeparator(intentId);
        ga.addEncodedQuery(encodedQuery, true);
        ga.query();

        if (ga.next())
            count = ga.getAggregate('COUNT');
        return {
            count: count,
            executionId: executionId
        };
    };

    NLUConflictExecution.addRecord = function(defintionId, modelSnapshot) {
        var record = new GlideRecord(tables.NLU_CONFLICT_EXECUTION);
        record.initialize();
        record.setValue(FIELDS.DEFINITION, defintionId);
        record.setValue(FIELDS.MODELS_DATA, JSON.stringify(modelSnapshot));
        record.setValue(FIELDS.STATUS, 'inprogress');
        return record.insert();
    };

    NLUConflictExecution._getInputJson = function(modelName, intentName) {
        return {
            intents: [{
                intentName: intentName,
                modelName: modelName
            }],
            mode: 'FAST'
        };
    };

    NLUConflictExecution._getOptions = function() {
        var currDate = (new Date()).toJSON();
        var currDateString = currDate.split('T')[0];
        return {
            clientRequestTime: currDateString,
            warnThreshold: "0.7",
            highThreshold: gs.getProperty(sysProps.CONFLICT_THRESHOLD_MODERATE, "0.85"),
            criticalThreshold: gs.getProperty(sysProps.CONFLICT_THRESHOLD_CRITICAL, "0.9")
        };
    };

    NLUConflictExecution._getIntent = function(eachResp) {
        if (eachResp.intentName === "NO_INTENT")
            return -1;
        var intentGr = new GlideRecord(global.NLUConstants.tables.SYS_NLU_INTENT);
        var joinGr = intentGr.addJoinQuery(global.NLUConstants.tables.SYS_NLU_MODEL, 'model', 'sys_id');

        intentGr.addQuery('name', eachResp.intentName);
        joinGr.addCondition('name', eachResp.modelName);

        intentGr.query();

        if (intentGr.next()) {
            return intentGr.getUniqueValue();
        }
        return null;
    };

    NLUConflictExecution._alreadyProcessed = function(srcIntent, tgtIntent) {
        if (srcIntent === -1 || tgtIntent === -1) return false;
        for (var i = 0; i < processedMap.length; i++) {
            var eachPair = processedMap[i];
            if (Object.keys(eachPair).indexOf(tgtIntent) !== -1) {
                if (eachPair[tgtIntent] === srcIntent) return true;
            }
            if (Object.keys(eachPair).indexOf(srcIntent) !== -1) {
                if (eachPair[srcIntent] === tgtIntent) return true;
            }
        }
        return false;
    };

    NLUConflictExecution.prototype = {

        initialize: function(executionId) {
            this.executionId = executionId;
        },

        getGR: function() {
            if (!gs.nil(this.gr)) return this.gr;
            this.gr = new GlideRecord(tables.NLU_CONFLICT_EXECUTION);
            return this.gr.get(this.executionId) && this.gr;
        },

        execute: function() {
            var allResponses = [];
            var conflictsCount = 0;
            var gr = this.getGR();

            try {

                var solutionInfo = this._getSolutionInfo();
                if (gs.nil(solutionInfo)) throw new Error(gs.getMessage('Unable to get model solution details'));

                solutionInfo.forEach(function(eachSolution) {
                    var modelIntents = NLUMLSolutionUtil.getIntents(
                        eachSolution.solutionVersion, eachSolution.modelId);

                    var modelName = modelIntents.model;
                    var intents = modelIntents.intents;

                    // filter out intents with no utterances
                    intents = intents.filter(function(intent) {
                        var intentId = NLUConflictExecution._getIntent({
                            intentName: intent,
                            modelName: modelName
                        });
                        if (intentId) {
                            var uttrCount = new GlideAggregate(global.NLUConstants.tables.SYS_NLU_UTTERANCE);
                            uttrCount.addQuery('intent', intentId);
                            uttrCount.addAggregate('COUNT');
                            uttrCount.query();
                            if (uttrCount.next()) {
                                if (uttrCount.getAggregate('COUNT') > 0) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });

                    for (var i = 0; i < intents.length; i++) {
                        var inputJson = NLUConflictExecution._getInputJson(modelName, intents[i]);
                        if (gs.nil(inputJson)) throw new Error(gs.getMessage('Unable to get modelname, intentname details'));

                        var result = sn_ml.MLServiceUtil.detectConflicts(
                            JSON.stringify(solutionInfo), JSON.stringify(inputJson), NLUConflictExecution._getOptions());
                        if (!gs.nil(result)) result = JSON.parse(result);
                        if (gs.nil(result) || result.status !== 'success') {
                            gs.debug('NLU Conflict execution: ' + this.executionId + ' response: ' + JSON.stringify(result));
                            throw new Error(gs.getMessage('Failed to detect conflicts'));
                        }
                        allResponses.push(result.response);
                    }
                });

                gr.setValue(FIELDS.STATUS, 'processing_results');
                gr.update();

                var resultsProcessor = new NLUConflictResultProcessor(this.executionId);

                allResponses.forEach(function(eachResp) {
                    var sourceIntent = NLUConflictExecution._getIntent(eachResp);
                    if (!gs.nil(sourceIntent)) {
                        var conflicts = eachResp.conflicts;
                        conflicts && conflicts.forEach(function(eachConflict) {
                            var targetIntent = NLUConflictExecution._getIntent(eachConflict);
                            if (!gs.nil(targetIntent)) {
                                if (!NLUConflictExecution._alreadyProcessed(sourceIntent, targetIntent)) {
                                    var conflictingUtterances = eachConflict.conflictingUtterances;
                                    conflictingUtterances && conflictingUtterances.forEach(function(eachUtterance) {
                                        if (!gs.nil(resultsProcessor.add(eachUtterance, sourceIntent, targetIntent)))
                                            conflictsCount++;
                                    });

                                    var newPair = {};
                                    newPair[sourceIntent] = targetIntent;
                                    processedMap.push(newPair);
                                }
                            }
                        });
                    }
                });

                gr.setValue(FIELDS.STATUS, 'success');
                gr.update();
            } catch (e) {
                gr.setValue(FIELDS.STATUS, 'failed');
                gr.update();
                this._errorResult(e.message);
            }
        },

        getConflictPairs: function(intentPair, filters, scope) {
            if (!this.executionId)
                throw new Exception(gs.getMessage('Execution ID is empty'));
            var intent1, intent2;
            if (Array.isArray(intentPair) && intentPair.length > 0) {
                intent1 = intentPair[0];
                if (intentPair.length > 1)
                    intent2 = intentPair[1];
            }
            var baseQuery = 'conflict_execution.sys_id=' + this.executionId;
            baseQuery += (filters && filters.showModerate) ? '^tagINcritical,high' : '^tagINcritical';
            if (filters && filters.hideReviewed)
                baseQuery += '^' + REVIEWED_QUERY;
            var query = baseQuery;
            if (intent1 && intent2) {
                var intentQuery1 = 'intent_1.sys_id=' + intent1 + '^intent_2.sys_id=' + intent2;
                var intentQuery2 = 'intent_1.sys_id=' + intent2 + '^intent_2.sys_id=' + intent1;
                query += '^' + intentQuery1 + '^NQ' + baseQuery + '^' + intentQuery2;
            } else if (intentPair.length > 1 && intent1 && !intent2) {
                query += '^intent_1.sys_id=' + intent1 + '^intent_2.sys_idISEMPTY';
            } else if (intentPair.length > 1 && !intent1 && intent2) {
                query += '^intent_1.sys_idISEMPTY' + '^intent_2.sys_id=' + intent2;
            } else if (intent1) {
                query += '^intent_1.sys_id=' + intent1 + '^NQ' + baseQuery + '^' + 'intent_2.sys_id=' + intent1;
            }
            return NLUConflictResult.getResults(query, scope);
        },

        _getSolutionInfo: function() {
            var modelSnapshot = JSON.parse(this.getGR().getValue(FIELDS.MODELS_DATA));
            if (!Array.isArray(modelSnapshot))
                throw new Error(gs.getMessage('Model list is empty'));

            var solutionInfo = [];
            modelSnapshot.forEach(function(eachModel) {
                solutionInfo.push({
                    solutionName: eachModel.name,
                    modelId: eachModel.id,
                    solutionVersion: eachModel.trained_version
                });
            });
            return solutionInfo;
        },

        _errorResult: function(message) {
            gs.error('NLU Conflict Analysis Execution: ' + this.executionId + ' > Error: ' + message);
            return {
                status: 'failure',
                message: message
            };
        },

        type: 'NLUConflictExecution'
    };
})();
