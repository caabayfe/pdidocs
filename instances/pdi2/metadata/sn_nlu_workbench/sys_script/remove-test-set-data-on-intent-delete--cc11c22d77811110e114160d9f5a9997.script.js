(function executeRule(current, previous /*null when async*/ ) {
    var modelId = current.getValue("model");
    if (modelId) {
        var batchTestSetGr = new GlideRecord("nlu_batch_test_set");
        batchTestSetGr.addEncodedQuery("model=" + modelId, true);
        batchTestSetGr.query();

        if (batchTestSetGr.next()) {
            var testSetId = batchTestSetGr.getValue("sys_id");
            var batchTestUttrGr = new GlideRecord("nlu_batch_test_utterance");
            batchTestUttrGr.addEncodedQuery("test_set=" + testSetId + "^intentLIKE" + current.name.trim(), true);
            batchTestUttrGr.query();

            while (batchTestUttrGr.next()) {
                var intents = batchTestUttrGr.getValue("intent");
                var intentsArr = [];
                var arrUtil = new global.ArrayUtil();
                if (intents) {
                    intentsArr = intents.split(",").map(function(element) {
                        return element.trim();
                    });
                }               
                if (intentsArr.length === 1) {
                    batchTestUttrGr.deleteRecord();
                } else {
                    intentsArr.splice(arrUtil.indexOf(intentsArr, current.name.trim()), 1);
                    batchTestUttrGr.setValue("intent", intentsArr.join(","));
                    batchTestUttrGr.update();              
                }
            }
        }
    }

})(current, previous);
