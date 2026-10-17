(function(step, stepResult, assertionObject) {

    assertionObject.executeStep = function(step, stepResult) {
        // Navigate to page. This should have access to UXF variable.
        g_ui_testing_util.openURL(step.inputs.workspace_page_url + "?atf=true").then(navigateToUXFPage);

        function navigateToUXFPage() {
            if (step.timeout > 0)
                g_ui_testing_util.setTestStepStatusMessage("Navigating to URL.");
            setTimeout(clearCacheAndRenav, step.timeout * 1000);
        }

        function clearCacheAndRenav() {
            // Now on the uxf page, clear cache and renavigate to the same page.
            var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
            testFrameWindow.uxf.clearClientCache();
            // Waiting for network calls to complete
            setTimeout(renav, 15 * 1000);
        }

        function renav() {
            g_ui_testing_util.openURL(step.inputs.workspace_page_url);
            setTimeout(passStep, step.timeout * 1000);
        }

        function passStep() {
            stepResult.success = true;
            stepResult.message = "Successfully navigated to page";
            step.defer.resolve();
        }
    };
    assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
