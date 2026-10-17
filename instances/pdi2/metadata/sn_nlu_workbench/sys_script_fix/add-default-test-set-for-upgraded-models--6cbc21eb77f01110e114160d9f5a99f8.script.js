(function() {
    var constants = global.NLUConstants.constants;
    var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;

    gs.info("Creating test set for models upgraded to Utah.");

    (function() {
        var modelGr = new GlideRecord(tables.SYS_NLU_MODEL);
        modelGr.addQuery("oob", false);
        modelGr.query();

        while (modelGr.next()) {
            var modelId = modelGr.getValue("sys_id");
            var language = modelGr.getValue("language");
            var display_name = modelGr.getValue("display_name");

            gs.info('Name: ' + modelGr.getValue("display_name"));

            var testGr = new GlideRecord(tables.NLU_BATCH_TEST_SET);
            testGr.addQuery("model", modelId);
            testGr.query();

            if (!testGr.hasNext()) {
                sn_nlu_workbench.NLUBatchTestSet.addRecord(
                    constants.DEFAULT_TEST_SET_PREFIX + display_name,
                    language,
                    'uploaded',
                    modelId
                );
            }
        }

        gs.info("Test set for models successfully created.");
    })();
})();
