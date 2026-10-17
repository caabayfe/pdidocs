(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var steps = JSON.parse(current.steps);
    var stepArray = Object.keys(steps);
    var stepDefinitions = stepArray.map(function(stepId) {
        return steps[stepId].stepDefinition;
    });
    var stepList = [];
    for (var stepDef of stepDefinitions) {
        var stepDefGR = new GlideRecord("sys_ui_interaction_step_definition");
        var defExists = stepDefGR.get(stepDef);

        // Check if interaction step definition is valid
        if (!defExists) {
            gs.addErrorMessage(gs.getMessage("Invalid step definition {0} referenced in the UI interaction.", stepDef));
            current.setAbortAction(true);
            break;
        }

        // Check if interaction step definition can be used with this interaction's type
        var associatedTypes = stepDefGR.getValue("associated_types")
			? stepDefGR.getValue("associated_types").split(",")
			: [];
        if (associatedTypes.length > 0 && !associatedTypes.includes(current.getValue("type"))) {
            gs.addErrorMessage(
                gs.getMessage(
                    "Step definition {0} cannot be referenced in UI interactions of type {1}",
                    [stepDefGR.getDisplayValue(), current.type.getDisplayValue()]
                )
            );
			// Reset interaction type value to previous value to not lock users in a read only state
			current.type = previous.type;
			current.setAbortAction(true);
            break;
        }
		
        if (!stepList.includes(stepDef)) {
            stepList.push(stepDef);
        }
    }

    current.step_definitions = stepList.join(',');

})(current, previous);
