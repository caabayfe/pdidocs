var NLUAdvLUAUtils = Class.create();

(function() {

    NLUAdvLUAUtils.recordUsageEvent = function(eventId, streamId, GCFMap) {
        GCFCollector.recordUsageEvent("nlu_wb", streamId, eventId, GCFMap);
    };

    // records the test set coverage of given model in batch test run
    NLUAdvLUAUtils.recordIntentTestSetCoverage = function(intentCoverage) {
        var GCFMap = new GCFSampleMap();
        GCFMap.put("intentCoverage", intentCoverage);
        NLUAdvLUAUtils.recordUsageEvent("intent_coverage", "batch_testing_insights", GCFMap);
    };

    // Util Class to record usage analytics. 
    NLUAdvLUAUtils.prototype = {
        initialize: function() {},

        type: 'NLUAdvLUAUtils'
    };
})();
