var NLUConflictResult = Class.create();

(function() {

    var tableName = NLUWorkbenchConstants.tables.NLU_CONFLICT_RESULT;

    var isReadOnly = function(utterance, scope) {
        if (utterance.intent.model.sys_policy === 'read')
            return true;
        return utterance.intent.model.sys_scope.toString() !== scope;
    };

    var getUtteranceData = function(gr, index, scope) {
        var utteranceId = gr.getValue('utterance_' + index);
        // handling irrelevant utterance case separately, since utterance reference is not present in table 
        if (!utteranceId)
            return {
                id: -1,
                text: gr.getValue('original_utterance_' + index),
                original: gr.getValue('original_utterance_' + index),
                readOnly: isReadOnly(gr['utterance_' + index], scope)
            };
        return {
            id: utteranceId,
            text: gr.getDisplayValue('utterance_' + index),
            original: gr.getValue('original_utterance_' + index),
            readOnly: isReadOnly(gr['utterance_' + index], scope)
        };
    };


    NLUConflictResult.getResults = function(query, scope) {
        var results = {
            high: [],
            critical: []
        };

        var gr = new GlideRecord(tableName);
        gr.addEncodedQuery(query);
        gr.query();
        while (gr.next()) {
            results[gr.getValue('tag')].push({
                sysId: gr.getUniqueValue(),
                ignored: gr.getValue('ignored') === '1',
                intent1: {
                    id: gr.getValue('intent_1') || -1,
                    name: gr.getDisplayValue('intent_1')
                },
                intent2: {
                    id: gr.getValue('intent_2') || -1,
                    name: gr.getDisplayValue('intent_2')
                },
                utterance1: getUtteranceData(gr, 1, scope),
                utterance2: getUtteranceData(gr, 2, scope),
            });
        }

        return results;
    };

    NLUConflictResult.prototype = {
        initialize: function() {},
        type: 'NLUConflictResult'
    };
})();
