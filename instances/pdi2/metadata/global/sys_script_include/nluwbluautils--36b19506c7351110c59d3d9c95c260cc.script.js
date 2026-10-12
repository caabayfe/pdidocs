var NLUWBLUAUtils = Class.create();

(function() {
    NLUWBLUAUtils.recordOOBIntentUsage = function(topicLangGr) {
        var intentId = topicLangGr.nlu_intent;
        var modelId = topicLangGr.nlu_model;

        var intentGr = new GlideRecord('sys_nlu_intent');
        intentGr.addQuery('name', intentId);
        intentGr.addQuery('model.name', modelId);
        intentGr.query();

        if (intentGr.next() && (intentGr.model.oob == true || (intentGr.origin && intentGr.origin.model.oob == true))) {
            var GCFMap = new GCFSampleMap();
            GCFMap.put("intent", (intentGr.origin && intentGr.origin.name) || intentGr.name);
            GCFMap.put("topic", topicLangGr.sys_id);
            GCFMap.put("language", topicLangGr.language_code);
            GCFCollector.recordUsageEvent("nlu_wb", "oob_nlu_insights", "oob_nlu_intent_usage", GCFMap);
        }
    };

    NLUWBLUAUtils.prototype = {
        initialize: function() {},

        type: 'NLUWBLUAUtils'
    };
})();
