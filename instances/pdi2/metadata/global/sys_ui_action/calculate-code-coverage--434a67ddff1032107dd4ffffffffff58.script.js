function getCodeCoverage() {
    // Step 1: Check if test result is in a valid state for aggregation
    var testResultId = g_form.getUniqueValue();
    var stateCheckGA = new GlideAjax("ATFCodeCoverageBridge");
    stateCheckGA.addParam('sysparm_name', 'checkTestResultState');
    stateCheckGA.addParam('sysparm_test_result_id', testResultId);
    stateCheckGA.getXMLAnswer(function(stateCheckResult) {
        var result = JSON.parse(stateCheckResult);
        
        if (!result.canAggregate) {
            // Test is still running or pending, show informational dialog
            showTestNotReadyDialog(result.state);
            return;
        }
        
        // Test is complete, proceed to check for batch tracker
        checkBatchTracker(testResultId);
    });
}

function showTestNotReadyDialog(state) {
    var dialog = new GlideModal('glide_modal_info', true, 400);
    dialog.setTitle(new GwtMessage().getMessage('Test Results Not Ready'));
    dialog.setPreference('body', new GwtMessage().getMessage('Please wait for the test to complete before calculating code coverage.'));
    dialog.setPreference('focusTrap', true);
    dialog.render();
}

function checkBatchTracker(testResultId) {
    // Step 2: Check if there's a batch tracker in progress
    var batchGA = new GlideAjax("ATFCodeCoverageBridge");
    batchGA.addParam('sysparm_name', 'getBatchTrackerId');
    batchGA.addParam('sysparm_test_result_id', testResultId);
    batchGA.getXMLAnswer(function(batchTrackerId) {
        if (batchTrackerId) {
            // Batch tracker exists, show it first
            showBatchTracker(batchTrackerId);
        } else {
            // No batch tracker, start aggregation
            startAggregation();
        }
    });
}

function showBatchTracker(trackerId) {
    var modal = new GlideModal("hierarchical_progress_viewer");
    modal.setTitle(new GwtMessage().getMessage("Persisting frontend coverage data"));
    modal.setPreference("sysparm_renderer_execution_id", trackerId);

    // When batch tracker completes, start aggregation
    modal.on("executionComplete", function() {
        modal.destroy();
        startAggregation();
    });

    modal.on("beforeclose", function() {
        g_navigation.reloadWindow();
    });

    modal.render();
}

function startAggregation() {
    var ga = new GlideAjax("ATFCodeCoverageBridge");
    ga.addParam('sysparm_name', 'aggregateTestCodeCoverage');
    ga.addParam('sysparm_test_result_id', g_form.getUniqueValue());
    ga.getXMLAnswer(function(aggregationTrackerId) {
        if (aggregationTrackerId) {
            showAggregationTracker(aggregationTrackerId);
        } else {
            gsftSubmit(null, g_form.getFormElement(), 'get_code_coverage');
        }
    });
}

function showAggregationTracker(trackerId) {
    var modal = new GlideModal("hierarchical_progress_viewer");
    modal.setTitle(new GwtMessage().getMessage("Calculating code coverage"));
    modal.setPreference("sysparm_renderer_execution_id", trackerId);

    // When aggregation completes, reload the page
    modal.on("executionComplete", function() {
        modal.destroy();
        g_navigation.reloadWindow();
    });

    modal.on("beforeclose", function() {
        g_navigation.reloadWindow();
    });

    modal.render();
}
