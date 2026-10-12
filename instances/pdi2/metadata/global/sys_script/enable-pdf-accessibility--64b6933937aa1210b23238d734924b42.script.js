(function executeRule(current, previous /*null when async*/ ) {
    // Ensure the current value is not null or undefined
    if (gs.nil(current.value))
        return;

    var currValue = String(current.value).toLowerCase();
    var prevValue = previous && previous.value ? String(previous.value).toLowerCase() : "false";

    // Proceed only if transitioning from "false" to "true"
    if (prevValue === "false" && currValue === "true") {
        try {
            var canExecuteOnService = sn_pdfgeneratorutils.PDFGenerationAPI.canExecuteOnService();
            if (!canExecuteOnService) {
                gs.addErrorMessage(gs.getMessage("Cannot enable the PDF Accessibility system property as this environment is unsupported"));
                current.value = prevValue; // Revert the value
                current.setAbortAction(true); // Abort the action
            }
        } catch (error) {
            gs.addErrorMessage(gs.getMessage("An unexpected error occurred while validating the environment: {0}", error.message));
            current.value = prevValue; // Revert the value
            current.setAbortAction(true); // Abort the action
        }
    }
})(current, previous);
