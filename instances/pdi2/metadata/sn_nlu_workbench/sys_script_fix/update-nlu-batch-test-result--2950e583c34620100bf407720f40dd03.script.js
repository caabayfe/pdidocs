/*
* This script was initially added in "Version 2.0.5 - May 2021"
* Is made "Run Once" in "Aug 2021" release. 

* Modifications to nlu_batch_test_result table: 
	1. Following fields are not being used:
		- predicted_intent
		- prediction_model
		- confidence_threshold
	2. 'predictions' json is updated with: 
		- filter the ones above threshold only
		- Also add modelId in each object of the array
	3. Updated outcome:
		- correctly_skipped is changed to correct
		- Updated the logic of outcome. 

* Modifications to nlu_batch_test_run_execution
	1. 'models_data' 
		- Aggregate counts of (correct, incorrect, incorrectly_skipped)
		- Intents Covered: intents_count (covered, total)
*/

(function() {
    var tables = NLUWorkbenchConstants.tables;
    var RESULT_TYPE = NLUWorkbenchConstants.BATCHTEST_RESULT_TYPE;

    var solutionNameToModelName = {};

    function getModelNameFromSolutionName(solutionName) {
        if (!solutionNameToModelName[solutionName]) {
            var mlGr = new GlideRecord('ml_solution');
            if (mlGr.get('solution_name', solutionName)) {
                solutionNameToModelName[solutionName] = mlGr.ml_capability_definition.solution_label + '';
            }
        }
        return solutionNameToModelName[solutionName];
    }

    var executionGr = new GlideRecord(tables.NLU_BATCH_TEST_RUN_EXECUTION);
    executionGr.addQuery('status', 'success');
    executionGr.query();
    while (executionGr.next()) {
        try {
            var executionId = executionGr.getUniqueValue();
            gs.info('Fix: Update NLU Batch Test Result - Processing execution: ' + executionId);

            var modelSnapshot = JSON.parse(executionGr.getValue('models_data') || '[]');
            modelSnapshot && modelSnapshot.forEach(function(snapshot) {
                // previously, name field has solutionName, 
                // now name will have modelName & solutionName will have solution name.
                var solutionName = snapshot.name;
                snapshot.name = getModelNameFromSolutionName(snapshot.name) || snapshot.name;
                if (!snapshot.solutionName)
                    snapshot.solutionName = solutionName;
            });

            var testExecution = new NLUBatchTestExecution(null, executionGr);
            var resultsHelper = new NLUBatchTestResults(testExecution);
            resultsHelper.initDataMap();

            var testResultGr = new GlideRecord(tables.NLU_BATCH_TEST_RESULT);
            testResultGr.addQuery('test_run_execution', executionId);
            testResultGr.query();
            while (testResultGr.next()) {
                var intentsData = JSON.parse(testResultGr.getValue('predictions') || '[]');
                var predictionData = {
                    utterance: testResultGr.utterance.utterance.toString(),
                    intents: intentsData
                };

                testResultGr.setValue('predicted_intent', '');
                testResultGr.setValue('prediction_model', '');
                testResultGr.setValue('confidence_threshold', '');
                var result = resultsHelper.addResult(predictionData, RESULT_TYPE.CURRENT, testResultGr);
                if (!result) {
                    gs.error('Fix: Update NLU Batch Test Result - Failed to update NLU Batch test result: ' + testResultGr.getUniqueValue());
                }
            }

            resultsHelper.updateSnapshot();
        } catch (e) {
            gs.error('Fix: Update NLU Batch Test Result - Failed to process execution: ' + executionId);
        }
    }

})();
