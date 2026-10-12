(function executeRule(current, previous /*null when async*/ ) {

    var FIELDS = MLLabeledData.FIELDS;
    var FEEDBACK_TYPE = MLLabeledData.FEEDBACK_TYPE;
    var USAGE = MLLabeledData.USAGE;
    var filter = FIELDS.LABEL_TYPE + 'IN' + FEEDBACK_TYPE.POSITIVE + ',' + FEEDBACK_TYPE.IRRELEVANT;

    var usageCounts = NLULabelFeedbackUtil.getUsageCounts(filter);
    if (usageCounts.modelTrain || usageCounts.batchTest) {
        var modelTrainPercentage = usageCounts.modelTrain * 100 / (usageCounts.modelTrain + usageCounts.batchTest);
        if (modelTrainPercentage > 80) {
            current.setValue(FIELDS.USAGE, USAGE.TESTING);
        }
    }

})(current, previous);
