var NLUConflictResultProcessor = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;
    var FIELDS = {
        EXECUTION: 'conflict_execution',
        UTTERANCE_1: 'utterance_1',
        UTTERANCE_2: 'utterance_2',
        INTENT_1: 'intent_1',
        INTENT_2: 'intent_2',
        ORIG_UTTERANCE_1: 'original_utterance_1',
        ORIG_UTTERANCE_2: 'original_utterance_2',
        TAG: 'tag',
        IGNORED: 'ignored'
    };
    var TAGS = {
        CRITICAL: 'critical',
        HIGH: 'high',
        WARNING: 'warning'
    };

    var lookupRegex = /@lookupSources:[^\s]+@@/g;

    NLUConflictResultProcessor.prototype = {

        initialize: function(executionId) {
            this.executionId = executionId;
        },

        _getUtteranceText: function(uttr) {
            return uttr.replace(lookupRegex, function(m) {
                return m.replace('@lookupSources:', '@').slice(0, -2);
            });
        },

        add: function(result, srcIntent, tgtIntent) {
            var origUtterance1Str = this._getUtteranceText(result.conflictUtterance);
            var origUtterance2Str = this._getUtteranceText(result.targetUtterance);
            var origUtterance1 = this._getUtterance(origUtterance1Str, tgtIntent);
            var origUtterance2 = this._getUtterance(origUtterance2Str, srcIntent);
            if (!origUtterance1 || !origUtterance2) return null;
            var tag = result.conflictLabel;

            var record = new GlideRecord(tables.NLU_CONFLICT_RESULT);
            record.initialize();
            record.setValue(FIELDS.EXECUTION, this.executionId);

            if (tgtIntent && tgtIntent !== -1) {
                record.setValue(FIELDS.UTTERANCE_1, origUtterance1);
                record.setValue(FIELDS.INTENT_1, tgtIntent);
            }
            if (srcIntent && srcIntent !== -1) {
                record.setValue(FIELDS.INTENT_2, srcIntent);
                record.setValue(FIELDS.UTTERANCE_2, origUtterance2);
            }
            record.setValue(FIELDS.ORIG_UTTERANCE_1, origUtterance1Str);
            record.setValue(FIELDS.ORIG_UTTERANCE_2, origUtterance2Str);
            record.setValue(FIELDS.TAG, tag);
            var resultId = record.insert();
            return resultId;
        },

        _getUtterance: function(utteranceText, intentId) {
            if (intentId === -1) return -1;
            var nluUtteranceGr = new GlideRecord(global.NLUConstants.tables.SYS_NLU_UTTERANCE);
            nluUtteranceGr.addQuery('intent', intentId);
            nluUtteranceGr.addQuery('utterance', utteranceText);
            nluUtteranceGr.query();
            return nluUtteranceGr.next() && nluUtteranceGr.getUniqueValue();
        },

        type: 'NLUConflictResultProcessor'
    };
})();
