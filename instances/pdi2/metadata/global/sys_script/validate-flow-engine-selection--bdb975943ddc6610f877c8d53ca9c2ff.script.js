(function executeRule(current, previous /*null when async*/ ) {
	var DEFAULT_PUBLISH_WORKFLOW = "fbe441019f112100d8f8700c267fcf1a";
	var DEFAULT_RETIRE_WORKFLOW = "3d18ef12c30031000096dfdc64d3aeb6";

    var flowEngineMap = {
        workflow: {
            workflow: 'mandatory',
            retire_workflow: 'mandatory',
            kb_publish_flow: '',
            kb_retire_flow: ''
        },
        flow: {
            workflow: '',
            retire_workflow: '',
            kb_publish_flow: 'mandatory',
            kb_retire_flow: 'mandatory'
        }
    };

    function isEngineSelectionEmpty() {
        var fields = Object.keys(flowEngineMap.workflow);
        for (var i = 0; i < fields.length; i++) {
            if (current.getValue(fields[i])) {
                return false;
            }
        }
        return true;
    }

    function haveSameBinaryValue(string1, string2) {
        return (!!string1 === !!string2); // Boolean comparison
    }

    function isValidCombination(formFields) {
        var fields = Object.keys(formFields);
        for (var i = 0; i < fields.length; i++) {
            if (!haveSameBinaryValue(formFields[fields[i]], current.getValue(fields[i]))) {
                return false;
            }
        }
        return true;
    }

    function handleError(message) {
        gs.addErrorMessage(message);
        current.setAbortAction(true);
    }

    /**
     * Validates and sets default workflow values for the current record.
     * 
     * This method checks if any flow values (`kb_publish_flow` or `kb_retire_flow`) are present.
     * If flow values exist, it exits early without making changes.
     * 
     * If no flow values exist but workflow values (`workflow` or `retire_workflow`) are present,
     * it ensures that default workflows are set for `workflow` and `retire_workflow` if they are empty.
     * 
     * @returns {boolean} - Returns true if default workflows were set, false otherwise.
     */
    function validateAndSetWorkflowDefaults() {
        var hasFlowValues = !gs.nil(current.getValue('kb_publish_flow')) || !gs.nil(current.getValue('kb_retire_flow'));
        var hasWorkflowValues = !gs.nil(current.getValue('workflow')) || !gs.nil(current.getValue('retire_workflow'));

        // If any flow values exist, return
        if (hasFlowValues) {
            return false;
        }

        // If both workflow and retire_workflow are empty, return
        if (!hasWorkflowValues) {
            return false;
        }

        // Set default workflows if not already set
        if (gs.nil(current.getValue('workflow'))) {
            current.setValue('workflow', DEFAULT_PUBLISH_WORKFLOW);
        }

        if (gs.nil(current.getValue('retire_workflow'))) {
            current.setValue('retire_workflow', DEFAULT_RETIRE_WORKFLOW);
        }

        return true;
    }

    if (isEngineSelectionEmpty()) {
        /* Sets default values when all 4 fields are empty. This will only execute for knowledge bases created from scripts. */
        current.setValue("workflow", DEFAULT_PUBLISH_WORKFLOW);
        current.setValue("retire_workflow", DEFAULT_RETIRE_WORKFLOW);
        return;
    }

	if (validateAndSetWorkflowDefaults())
	{
		return;
	}
	

    var selectedEngine = (!gs.nil(current.getValue('workflow')) || !gs.nil(current.getValue('retire_workflow'))) ? 'workflow' : 'flow';
	
    if (!isValidCombination(flowEngineMap[selectedEngine])) {
        if (selectedEngine === 'workflow') {
            if (!gs.nil(current.getValue('workflow'))) {
                handleError(gs.getMessage("To create or update a record, select a corresponding retire workflow for the publish workflow you selected."));
            } else if (!gs.nil(current.getValue('retire_workflow'))) {
                handleError(gs.getMessage("To create or update a record, select a corresponding publish workflow for the retire workflow you selected."));
            }
        } else if (selectedEngine === 'flow') {
            if (!gs.nil(current.getValue('kb_publish_flow'))) {
                handleError(gs.getMessage("To create or update a record, select a corresponding retire flow for the publish flow you selected."));
            } else if (!gs.nil(current.getValue('kb_retire_flow'))) {
                handleError(gs.getMessage("To create or update a record, select a corresponding publish flow for the retire flow you selected."));
            }
        }
    }


})(current, previous);
