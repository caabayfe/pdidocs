var NLULabelFeedbackUtil = Class.create();

(function() {

    var tables = NLUConstants.tables;
    var FIELDS = MLLabeledData.FIELDS;
    var FEEDBACK_TYPE = MLLabeledData.FEEDBACK_TYPE;
    var SOURCE = MLLabeledData.SOURCE;
    var PRODUCT = MLLabeledData.PRODUCT;
    var USAGE = MLLabeledData.USAGE;
    var LABEL_PREFIX = MLLabeledData.LABEL_PREFIX;

    var DEFAULT_NLU_VALS = {};
    DEFAULT_NLU_VALS[FIELDS.SOURCE] = SOURCE.NLU;
    DEFAULT_NLU_VALS[FIELDS.PRODUCT] = PRODUCT.NLU;

    var getLabelData = function(nluData) {
        var labelData = {};
        labelData[FIELDS.TEXT] = nluData.utterance;
        labelData[FIELDS.USAGE] = USAGE.MODEL_TRAIN; // By default set to model-train.
        if (nluData.intent) {
            labelData[FIELDS.LABEL_REFERENCE] = nluData.intent;
            labelData[FIELDS.LABEL_TABLE] = tables.SYS_NLU_INTENT;
            var lableName = nluData.model_name + '.' + nluData.intent_name;
            labelData[FIELDS.LABEL] = LABEL_PREFIX[tables.SYS_NLU_INTENT] + ':' + lableName;
        } else {
            labelData[FIELDS.LABEL_REFERENCE] = nluData.model;
            labelData[FIELDS.LABEL_TABLE] = tables.SYS_NLU_MODEL;
            labelData[FIELDS.LABEL] = LABEL_PREFIX[tables.SYS_NLU_MODEL] + ':' + nluData.model_name;
        }
        return labelData;
    };

    var preChecks = function(nluData, feedback) {
        var filter = nluData.intent ? 'intent=' + nluData.intent : 'intent.model=' + nluData.model;
        var utteranceGr = NLUUtterance.getUtteranceByName(nluData.utterance, filter);
        if (utteranceGr.next()) {
            // Thumbs Up → Exact utterance exists in this intent? → Don't add entry. 
            if (feedback === FEEDBACK_TYPE.POSITIVE) return false;

            // Thumbs down → Exact utterance exists in the top predicted intent? → Delete utterance them.
            if (feedback === FEEDBACK_TYPE.NEGATIVE)
                utteranceGr.deleteRecord();
        }
        return true;
    };

    // Creates / update ml_labled_data record:
    var recordFeedback = function(labelData) {
        NLUHelper.extend(labelData, DEFAULT_NLU_VALS);
        var mlLabeledDataGr = MLLabeledData.getRecords(labelData);
        if (mlLabeledDataGr.next()) {
            var currentFeedback = mlLabeledDataGr.getValue(FIELDS.LABEL_TYPE);
            if (currentFeedback != labelData[FIELDS.LABEL_TYPE]) {
                for (var key in labelData)
                    mlLabeledDataGr.setValue(key, labelData[key]);

                if (!mlLabeledDataGr.update())
                    throw new Error(gs.getMessage('Unable to update utterance label Data'));
            }
        } else {
            if (!MLLabeledData.createRecord(labelData))
                throw new Error(gs.getMessage('Unable to create utterance label Data'));
        }
        return labelData;
    };

    NLULabelFeedbackUtil.getUsageCounts = function(filter) {
        var ga = new GlideAggregate(MLLabeledData.TABLE);
        ga.addAggregate('COUNT', FIELDS.USAGE);
        ga.addQuery(FIELDS.PRODUCT, PRODUCT.NLU);
        if (filter) ga.addEncodedQuery(filter);
        ga.query();
        var modelTrainCnt = 0;
        var batchTestCnt = 0;
        while (ga.next()) {
            var usage = ga.getValue(FIELDS.USAGE);
            if (usage === USAGE.MODEL_TRAIN)
                modelTrainCnt = parseInt(ga.getAggregate('COUNT', FIELDS.USAGE));
            if (usage === USAGE.TESTING)
                batchTestCnt = parseInt(ga.getAggregate('COUNT', FIELDS.USAGE));
        }
        return {
            modelTrain: modelTrainCnt,
            batchTest: batchTestCnt
        };
    };

    NLULabelFeedbackUtil.getLabelFeedback = function(nluData) {
        if (!nluData.utterance || (!nluData.model && !nluData.intent))
            throw new Error(gs.getMessage('Invalid input, please provide utterance, model / intent'));

        var labelDataGr = MLLabeledData.getRecords(getLabelData(nluData));
        return labelDataGr.next() && NLUSystemUtil.getObjectFromGR(labelDataGr);
    };

    NLULabelFeedbackUtil.saveLabelFeedback = function(nluData, feedback, options) {
        if (!nluData.utterance || !nluData.model)
            throw new Error(gs.getMessage('Invalid input, please provide utterance, model'));
        if (!feedback)
            throw new Error(gs.getMessage('Invalid input, please provide feedback: {0}', NLUHelper.objValues(FEEDBACK_TYPE).join('/')));

        var labelData = getLabelData(nluData);
        labelData[FIELDS.LABEL_TYPE] = feedback;
        if (!preChecks(nluData, feedback))
            return labelData;

        if (options && options.addUtteranceToIntent &&
            nluData.intent && feedback === FEEDBACK_TYPE.POSITIVE) {
            NLUUtterance.deleteRecords(nluData.model, 'utterance=' + nluData.utterance);
            NLUUtterance.addRecord(nluData.utterance, nluData.intent);
            return labelData;
        } else {
            // If feedback is negative, then delete utterance from other intents: 
            if (nluData.intent && feedback === FEEDBACK_TYPE.NEGATIVE)
                NLUUtterance.deleteRecords(nluData.model, 'intent=' + nluData.intent + '^utterance=' + nluData.utterance);

            // If irrelevant, then remove other entries for this utterance, if present in intents of this model. 
            if (feedback === FEEDBACK_TYPE.IRRELEVANT) {
                var filter = FIELDS.TEXT + '=' + nluData.utterance + '^' + FIELDS.LABEL_REFERENCE + '.model=' + nluData.model;
                MLLabeledData.deleteRecords(filter);
                NLUUtterance.deleteRecords(nluData.model, 'utterance=' + nluData.utterance);
            }
            return recordFeedback(labelData);
        }
    };

    NLULabelFeedbackUtil.prototype = {
        initialize: function() {},
        type: 'NLULabelFeedbackUtil'
    };

})();
