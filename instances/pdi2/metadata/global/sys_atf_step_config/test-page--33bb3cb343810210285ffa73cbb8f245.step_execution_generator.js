(function(step, stepResult, assertionObject) {
    assertionObject.executeStep = function(step, stepResult) {
        function passStep() {
            if (step.timeout > 0)
                g_ui_testing_util.setTestStepStatusMessage('Performing ATF action.');
            setTimeout(_passStep, step.timeout * 1000);

            function _passStep() {
                stepResult.success = true;
                stepResult.message = 'Successfully performed the action.';
                step.defer.resolve();
            }
        }

        function failStep(msg) {
            stepResult.success = false;
            stepResult.message = msg;
            g_ui_testing_util.setTestStepStatusMessage(msg);
            step.defer.reject();
        }
        var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
		
        var theReturn = step.inputs.returns;
        if (theReturn && typeof theReturn === 'string' && theReturn.length>1 
        && theReturn.startsWith('"') && theReturn.endsWith('"') ) 
            theReturn = theReturn.slice(1, -1);
        
        testFrameWindow.uxf.doATFAction(step.inputs.function_to_call, step.inputs.action_parameters,
                deleteUpToLastHyphen(step.inputs.component), step.inputs.hidden_parent_macroponent, theReturn)
            .then(function(result) {
                if (result)
                    passStep();
                else
                    failStep("Function: '" + step.inputs.hidden_function_description + "' returned " + result);
            })
            .catch(function(error) {
                failStep(error.message);
            });
    };

    function deleteUpToLastHyphen(inputString) {
        var index = inputString.lastIndexOf('-');
        if (index !== -1) {
            return inputString.substring(index + 1);
        }
        return inputString;
    }
    assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
