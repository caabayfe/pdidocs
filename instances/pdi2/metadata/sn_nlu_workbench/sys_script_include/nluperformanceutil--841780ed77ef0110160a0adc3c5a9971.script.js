var NLUPerformanceUtil = Class.create();

var OUTCOME_QUERIES = {
    CORRECT: 'correct,correct_among_multiple',
    SINGLE_CORRECT: 'correct',
    CORRECT_AMONG_MULTIPLE: 'correct_among_multiple',
    INCORRECT: 'incorrect,incorrect_among_multiple,uncategorized',
    SINGLE_INCORRECT: 'incorrect',
    INCORRECT_AMONG_MULTIPLE: 'incorrect_among_multiple,uncategorized',
    UNKNOWN: 'skipped,uncategorized',
    NO_PREDICTION: 'skipped',
    SINGLE_UNKNOWN: 'uncategorized'
};

var tableName = 'open_nlu_predict_intent_feedback';

NLUPerformanceUtil.prototype = {
    initialize: function() {},

    getAuditLogByTask: function(task) {
        var gr = new GlideRecord(tableName);
        gr.addQuery('app_document', task);
        gr.chooseWindow(0, 1);
        gr.query();

        while (gr.next()) {
            return gr.getValue('audit_log');
        }
        return null;
    },

    getDynamicallyTranslatedLog: function() {
        var translatedLogs = {};

        var gr = new GlideRecord('sys_cs_message');
        gr.addEncodedQuery('va_system_payload!=NULL');
        gr.query();
        while (gr.next()) {
            var task = gr.getValue('task');
            var log = this.getAuditLogByTask(task);
            if (log) {
                translatedLogs[log] = 1;
            }
        }
        return translatedLogs;
    },

    getLogsMapByOutcome: function(selectedId, encodedQuery, outcomes, ignoreLogs) {
        // CORRECT, SINGLE_CORRECT, CORRECT_AMONG_MULTIPLE, SINGLE_INCORRECT and NO_PREDICTION cases
        var auditLogMap = outcomes ? ignoreLogs : {};

        var gr = new GlideRecord(tableName);
        var outcomeQuery = encodedQuery + '^nlu_discovery_outcomeIN' + (outcomes || OUTCOME_QUERIES[selectedId]);
        gr.addEncodedQuery(outcomeQuery);
        gr.query();
        while (gr.next()) {
            var log = gr.getValue('audit_log');
            if (outcomes || !ignoreLogs[log]) {
                auditLogMap[log] = 1;
            }
        }
        return auditLogMap;
    },

    getLogsByAggregration: function(selectedId, encodedQuery, ignoreLogs, isMultiple) {
        // INCORRECT, INCORRECT_AMONG_MULTIPLE, UNKNOWN and SINGLE_UNKNOWN cases
        var logs = [];
        var agg = new GlideAggregate(tableName);
        var outcomeQuery = encodedQuery + '^nlu_discovery_outcomeIN' + OUTCOME_QUERIES[selectedId];
        agg.addAggregate('COUNT', 'audit_log');
        agg.addEncodedQuery(outcomeQuery, true);
        agg.query();
        while (agg.next()) {
            var count = parseInt(agg.getAggregate('COUNT', 'audit_log'));
            var countCheck = isMultiple ? count > 1 : count === 1;
            var log = agg.getValue('audit_log');
            if (countCheck && !ignoreLogs[log]) {
                logs.push(log);
            }
        }
        return logs;
    },

    getAuditLogs: function(selectedId, encodedQuery, translatedLogMap) {
        // TODO: Decouple the logic into single use-cases
        var skipOutcome = '',
            logMap = {};
        if (selectedId === 'UNKNOWN' || selectedId === 'SINGLE_UNKNOWN') {
            skipOutcome = OUTCOME_QUERIES.CORRECT + ',' + OUTCOME_QUERIES.SINGLE_INCORRECT + ',incorrect_among_multiple';
            logMap = this.getLogsMapByOutcome(selectedId, encodedQuery, skipOutcome, translatedLogMap);
            return this.getLogsByAggregration(selectedId, encodedQuery, logMap, false);
        } else if (selectedId === 'INCORRECT_AMONG_MULTIPLE' || selectedId === 'INCORRECT') {
            skipOutcome = OUTCOME_QUERIES.CORRECT;
            if (selectedId === 'INCORRECT_AMONG_MULTIPLE') {
                skipOutcome += ',' + OUTCOME_QUERIES.SINGLE_INCORRECT;
            }
            logMap = this.getLogsMapByOutcome(selectedId, encodedQuery, skipOutcome, translatedLogMap);
            var multiplePredOutcome = this.getLogsByAggregration(selectedId, encodedQuery, logMap, true);
            if (selectedId !== 'INCORRECT_AMONG_MULTIPLE') {
                var singlePredOutcome = this.getLogsByAggregration('SINGLE_INCORRECT', encodedQuery, logMap, false);
                for (var i = 0; i < singlePredOutcome.length; ++i) {
                    if (multiplePredOutcome.indexOf(singlePredOutcome[i]) === -1)
                        multiplePredOutcome.push(singlePredOutcome[i]);
                }
            }
            return multiplePredOutcome;
        }
        return Object.keys(this.getLogsMapByOutcome(selectedId, encodedQuery, null, translatedLogMap));
    },

    getPerformanceInfoCount: function(encodedQuery) {
        var gr = new GlideAggregate(tableName);
        gr.addEncodedQuery(encodedQuery, true);
        gr.addAggregate('COUNT');
        gr.query();
        return gr.next() ? parseInt(gr.getAggregate('COUNT')) : 0;
    },

    getPerformanceInfo: function(selectedIds, encodedQuery, translatedLogMap, offset, limit) {
        if (selectedIds.length === 0) {
            return {
                data: [],
                count: 0
            };
        }
        var auditLogs = [],
            performanceQuery = encodedQuery;
        if (selectedIds.indexOf('ALL_OUTCOME') < 0) {
            var _self = this;
            selectedIds.forEach(function(selectedId) {
                auditLogs = auditLogs.concat(_self.getAuditLogs(selectedId, encodedQuery, translatedLogMap));
            });

            if (auditLogs.length > 0) {
                performanceQuery += '^audit_logIN' + auditLogs.join(',');
            }
        } else {
            performanceQuery += '^audit_logNOT IN' + Object.keys(translatedLogMap).join(',');
        }

        var count = this.getPerformanceInfoCount(performanceQuery);
        performanceQuery += '^ORDERBYutterance,sys_created_on,audit_log,nlu_discovery_outcome';
        var gr = new GlideRecord(tableName);
        gr.addEncodedQuery(performanceQuery);
        gr.chooseWindow(offset > 0 ? offset - 1 : 0, offset + limit + 1); // -1 and +1 is to cover =1 and >1 uncategorised outcome distribution
        gr.query();
        var id = '',
            predictionInfo = {},
            i = 0,
            data = [];
        while (gr.next()) {
            if (id === gr.getValue('audit_log') && (offset === 0 || i != 1)) {
                predictionInfo = {
                    id: gr.getValue('audit_log') + "-" + Math.random(),
                    createdOn: gr.getDisplayValue('sys_created_on'),
                    modelName: gr.getDisplayValue('nlu_model'),
                    prediction: gr.getValue('prediction'),
                    utterance: gr.getValue('utterance')
                };
                if (gr.getValue('nlu_discovery_outcome') === data[i - 1].outcome) {
                    // this overriding is needed for multiple uncategorised outcome which should be grouped as incorrect among multiple
                    data[i - 1].outcome = 'incorrect_among_multiple';
                }
            } else {
                id = gr.getValue('audit_log');
                predictionInfo = {
                    id: gr.getValue('audit_log'),
                    createdOn: gr.getDisplayValue('sys_created_on'),
                    groupedUtterance: gr.getValue('utterance'),
                    modelName: gr.getDisplayValue('nlu_model'),
                    outcome: gr.getValue('nlu_discovery_outcome'),
                    prediction: gr.getValue('prediction'),
                    utterance: gr.getValue('utterance')
                };
                if (offset !== 0 && i === 1 && gr.getValue('nlu_discovery_outcome') === data[0].outcome) {
                    // this overriding is needed for multiple uncategorised outcome which should be grouped as incorrect among multiple
                    predictionInfo.outcome = 'incorrect_among_multiple';
                }
            }
            data.push(predictionInfo);
            ++i;
        }
        return {
            data: data.splice(offset > 0 ? 1 : 0, limit),
            count: count
        };
    },

    type: 'NLUPerformanceUtil'
};
