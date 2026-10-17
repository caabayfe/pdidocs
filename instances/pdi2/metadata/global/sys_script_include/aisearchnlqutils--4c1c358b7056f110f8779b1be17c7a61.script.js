var AISearchNLQUtils = Class.create();
AISearchNLQUtils.prototype = {

    initialize: function() {},

    execute: function(inputs) {
        var query = inputs.query;
        var processor = sn_nlq.JavascriptProcessorScoped;
        var start = new Date().getTime();

        try {
            // get the navigation configuration for the search profile
            var navConfig = [];
            var navConfigGr = new GlideRecord('ais_nlq_navigation');
            navConfigGr.addActiveQuery();
            navConfigGr.query();

            while (navConfigGr.next()) {
                navConfig.push({
                    'source': navConfigGr.getValue('source'),
                    'action': navConfigGr.getValue('action'),
                    'profile': navConfigGr.getValue('profile'),
                    'action_payload': navConfigGr.getValue('action_payload'),
                    'table': navConfigGr.getValue('table')
                });
            }

            // single table valid sources: CB -> list view, RD -> Report Designer, AC -> Analytics center
            // multi table valid sources: CMDB_QB and CMDB_WS, both are equivalent
            var matchesAC = {};
            try {
                matchesAC = JSON.parse(processor.findDrivingTables(query, 'AC'));
            } catch (e) {
                gs.error("Error in NLQ Script: ", e);
            }
            gs.debug('NLQ GR - AC table query time: ' + (new Date().getTime() - start) + 'ms');
            var tablesAC = Object.keys(matchesAC);
            start = new Date().getTime();
            var matchesCMDB = {};
            try {
                matchesCMDB = JSON.parse(processor.findDrivingTables(query, 'CMDB_WS'));
            } catch (e) {
                gs.error("Error in NLQ Script: ", e);
            }
            gs.debug('NLQ GR - CMDB_WS table query time: ' + (new Date().getTime() - start) + 'ms');
            var tablesCMDB = Object.keys(matchesCMDB);

            // check for a multi-table response from CMDB
            var multiTables = {};
            var mappedTableNames = [];

            for (var key in matchesCMDB) {
                // for each table match
                if (matchesCMDB.hasOwnProperty(key)) {
                    var val = matchesCMDB[key];
                    // find the other tables which match the same term in the utterance
                    for (otherKey in matchesCMDB) {
                        var combinedVals = multiTables[val];
                        var otherVal = matchesCMDB[otherKey];
                        if ((mappedTableNames.indexOf(otherKey) < 0) && (val === otherVal || val.contains(otherVal) || otherVal.contains(val))) {
                            mappedTableNames.push(otherKey);
                            // map the tables to the term
                            if (combinedVals) {
                                combinedVals[combinedVals.length] = {
                                    id: otherKey,
                                    label: GlideTableDescriptor.get(otherKey).getLabel(),
                                    sublabel: otherKey
                                };
                            } else multiTables[val] = [{
                                id: otherKey,
                                label: GlideTableDescriptor.get(otherKey).getLabel(),
                                sublabel: otherKey
                            }];
                        }
                    }
                }
            }

            // if there are multiple unique terms in the utterance which match tables,
            // then the utterance resulted in a multi-table response
            if (Object.keys(multiTables).length > 1) {
                for (var table in multiTables) {
                    multiTables[table].push({
                        id: 'none',
                        label: 'None of the above'
                    });
                }

                gs.debug('NLQ GR - multitable: ' + JSON.stringify(multiTables));

                // the component will be required to run the applyMultiTable and queryBuilder APIs
                // because the user can update their table selections within the component
                // and when they do, we will need to re-run these same APIs
                return {
                    'output': {
                        'response': JSON.stringify(multiTables),
                        'multiTable': 'true',
                        'responseMeta': inputs.meta,
                        'navConfig': JSON.stringify(navConfig)
                    }
                };
            }

            // remove duplicate tables and tables restricting user access
            tablesAC = tablesAC.filter(function(table) {
                var gr = new GlideRecordSecure(table);
                if (!gr.canRead()) {
                    gs.error('NLQ GR - User: ' + user.getFullName() + ' not authorized to access: ' + table);
                    return false;
                }
                return tablesCMDB.indexOf(table) < 0;
            });

            tablesCMDB = tablesCMDB.filter(function(table) {
                var gr = new GlideRecordSecure(table);
                if (!gr.canRead()) {
                    gs.error('NLQ GR - User: ' + user.getFullName() + ' not authorized to access: ' + table);
                    return false;
                }
                return true;
            });

            var filtersAC = [];

            if (tablesAC.length + tablesCMDB.length < 1) return {
                'output': {
                    'responseMeta': inputs.meta
                }
            };

            for (var i = 0; i < tablesAC.length; i++) {
                var currentTable = tablesAC[i];
                var gr = new GlideRecordSecure(currentTable);
                if (!gr.canRead()) {
                    gs.error('NLQ GR - User: ' + user.getFullName() + ' not authorized to access: ' + currentTable);
                    continue;
                }

                start = new Date().getTime();
                var apply = processor.apply(currentTable, query, 'AI_SEARCH');
                gs.debug('NLQ GR - AC filter query time: ' + (new Date().getTime() - start) + 'ms for ' + query);
                if (apply['errorMessage']) {
                    gs.error('NLQ GR - AC filter query error message: ' + apply['errorMessage']);
                    continue;
                }
                var parserOutput = JSON.parse(apply['parserOutput']);
                var generativeAI = apply['output_source'] === 'GAI';
                var logID = apply['nlqQueryLogTableSysId'];
                var label = GlideTableDescriptor.get(currentTable).getLabel();

                var value = {
                    'name': currentTable,
                    'label': label,
                    'filter': parserOutput.filter,
                    'source': 'AC',
                    'GAI': generativeAI,
                    'logID': logID
                };
                filtersAC.push(value);
            }


            var filtersCMDB = [];

            for (var j = 0; j < tablesCMDB.length; j++) {
                var cmdbTable = tablesCMDB[j];
                var cmdbGr = new GlideRecordSecure(cmdbTable);
                if (!cmdbGr.canRead()) {
                    gs.error('NLQ GR - User: ' + user.getFullName() + ' not authorized to access: ' + cmdbTable);
                    continue;
                }

                start = new Date().getTime();
                var cmdbApply = processor.apply(cmdbTable, query, 'AI_SEARCH');
                gs.debug('NLQ GR - CMDB_WS filter query time: ' + (new Date().getTime() - start) + 'ms for ' + query);
                if (cmdbApply['errorMessage']) {
                    gs.error('NLQ GR - CMDB_WS filter query error message: ' + cmdbApply['errorMessage']);
                    continue;
                }
                var cmdbParserOutput = JSON.parse(cmdbApply['parserOutput']);
                var cmdbGenerativeAI = cmdbApply['output_source'] === 'GAI';
                var cmdbLogID = cmdbApply['nlqQueryLogTableSysId'];
                var cmdbLabel = GlideTableDescriptor.get(cmdbTable).getLabel();

                var cmdbValue = {
                    'name': cmdbTable,
                    'label': cmdbLabel,
                    'filter': cmdbParserOutput.filter,
                    'source': inputs.wsAccess ? 'CMDB_WS' : 'AC',
                    'GAI': cmdbGenerativeAI,
                    'logID': cmdbLogID
                };
                filtersCMDB.push(cmdbValue);
            }

            var filters = filtersAC.concat(filtersCMDB);
            gs.debug('NLQ GR - filters: ' + JSON.stringify(filters));
            return {
                'output': {
                    'response': JSON.stringify(filters),
                    'multiTable': 'false',
                    'responseMeta': inputs.meta,
                    'navConfig': JSON.stringify(navConfig)
                }
            };
        } catch (e) {
            gs.error("Error during NLQ Genius Result Processing: ", e);
            return {
                "output": {
                    'responseMeta': inputs.meta
                }
            };
        }
    },

    processCompleted: function(response) {
        var answer = new sn_ais.GeniusResultAnswer();
        var postProcessor = new sn_search.ScriptableAsyncGeniusResultProcessor();
        var result = this.getCapabilityResultFromResponse(response);
        if (!result.result.output.hasOwnProperty('response') || !result.result.output.hasOwnProperty('responseMeta')) {
            this.processCancelled(response);
            return;
        }

        var initialDataMap = result.result.output.responseMeta.initialDataMap;
        var metadata = result.result.output.responseMeta;
        if (result.result.output.response && result.result.output.response.length > 2) {
            initialDataMap.response = result.result.output.response;
            initialDataMap.multiTable = result.result.output.multiTable;
            initialDataMap.navConfig = result.result.output.navConfig;
            answer.addDataMap(initialDataMap);
        }

        metadata.transactionId = response.transactionId;
        try {
            postProcessor.handleAnswer(answer, metadata);
        } catch (e) {
            gs.error("An error occurred while post processing NLQ genius result", e);
            postProcessor.processError(metadata, "An error occurred while post processing NLQ genius result");
        }
    },

    getCapabilityResultFromResponse: function(response) {
        var capabilityResult;
        for (var key in response.result) {
            if (response.result.hasOwnProperty(key)) {
                capabilityResult = response.result[key];
                break;
            }
        }
        return capabilityResult;
    },

    processErrored: function(oneApiResponse) {
        var postProcessor = new sn_search.ScriptableAsyncGeniusResultProcessor();
        var result = this.getCapabilityResultFromResponse(oneApiResponse);
        var inputs = result.requestPayload;
        postProcessor.processError(inputs.meta, oneApiResponse.error);
        gs.error("There was an error during processing of the NLQ Genius Result. Transaction ID: " + oneApiResponse.transactionId + " and error: " + oneApiResponse.error);
    },

    processCancelled: function(oneApiResponse) {
        var postProcessor = new sn_search.ScriptableAsyncGeniusResultProcessor();
        var result = this.getCapabilityResultFromResponse(oneApiResponse);
        var inputs = result.requestPayload;
        postProcessor.processCancellation(inputs.meta);
        gs.error("There processing of the NLQ Genius Result was cancelled. Transaction ID: " + oneApiResponse.transactionId + " and error: " + oneApiResponse.error);
    },

    type: 'AISearchNLQUtils'
};
