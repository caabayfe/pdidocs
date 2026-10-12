function onSubmit() {
    if (!g_scratchpad.isKBWorkflowActive) {
        return;
    }

    function getNumber(str) {
        return typeof str === 'string' && str !== '' ? 1 : 0;
    }

    /**
     * Checks if exactly one of the two provided values is set.
     */
    function isValidSelection(flow, workflow) {
        flow = getNumber(flow);
        workflow = getNumber(workflow);
        return ((flow ^ workflow) == 1);
    }

    var publishWorkflow = g_form.getValue('workflow');
    var publishFlow = g_form.getValue('kb_publish_flow');
    var retireWorkflow = g_form.getValue('retire_workflow');
    var retireFlow = g_form.getValue('kb_retire_flow');

    function handleErrorMessage(message) {
        g_form.addErrorMessage(message);
        return false;
    }

    if (!isValidSelection(publishFlow, publishWorkflow)) {
        if (retireWorkflow)
            return handleErrorMessage(getMessage("To create or update a record, select a corresponding publish workflow for the retire workflow you selected."));
        else if (retireFlow)
            return handleErrorMessage(getMessage("To create or update a record, select a corresponding publish flow for the retire flow you selected."));
        else
            return handleErrorMessage(getMessage("To create or update a record, select a publish workflow or publish flow, and the corresponding retire workflow or retire flow."));
    }

    if (!isValidSelection(retireFlow, retireWorkflow)) {
        if (publishWorkflow)
            return handleErrorMessage(getMessage("To create or update a record, select a corresponding retire workflow for the publish workflow you selected."));
        else if (publishFlow)
            return handleErrorMessage(getMessage("To create or update a record, select a corresponding retire flow for the publish flow you selected."));
        else
            return handleErrorMessage(getMessage("To create or update a record, select a publish workflow or publish flow, and the corresponding retire workflow or retire flow."));
    }

    return true;
}
