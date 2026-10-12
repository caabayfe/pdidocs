(function process(/*ResolverEnvironment*/ env) {
	var padUtils = new PADUtilsSI();
	if (!padUtils.isPADAuthorizedUser())
		return {
			errorType: 'UNAUTHORIZED',
			message: "You are unauthorized to perform this action."
		};
	
	var activities = env.getArguments().activities;
	
	if (!activities || !Array.isArray(activities))
		return;

	var arrayLength = activities.length;
	var activitiesToReturn = [];

	try {
		for (var i = 0; i < arrayLength; i++) {
			var activity = activities[i];
			var sysId = activity.sys_id;

			var activityGr = new GlideRecordSecure("sys_pd_activity");
			activityGr.get(sysId);

			if (activityGr.isValidRecord()) {
				activityGr.setValue("order", activity.order);
				activityGr.setValue("lane", activity.lane);
				activityGr.setValue("start_rule", activity.start_rule);
				
				var inputs = activity.inputs;
				var hasInputs = inputs && Array.isArray(inputs) && inputs.length;
				
				if (hasInputs) {
					inputs.forEach(function(input){
						var inputName = input.variableName;
						activityGr.getElement("inputs."+inputName).setValue(input.variableValue);
				activityGr.getElement("inputs."+inputName).setValueMapping(input.variableMapping);
					});
				}
			
				activityGr.update();
				
				var updatedRecordGr = new GlideRecordSecure('sys_pd_activity');
				updatedRecordGr.get(sysId);

				var updatedRecord = {
					sys_id: sysId,
					order: updatedRecordGr.getValue("order"),
					lane: updatedRecordGr.getValue("lane"),
					start_rule: updatedRecordGr.getValue("start_rule")
				};

				if (hasInputs) {
                    var inputNames = updatedRecordGr.getElement("inputs").getVariableNames();
                    updatedRecord.inputs = [];

                     for (var k = 0; k < inputNames.length; k++) {
                        var name = inputNames[k];
						var variableElement = updatedRecordGr.getElement("inputs").getVariablesRecord().getElement(name);
                        updatedRecord.inputs.push({
                            variableName: name,
                            variableValue: updatedRecordGr.getElement("inputs").getVariableValue(name),
                            variableMapping: variableElement.getValueMapping(),
							variableDisplayValue: variableElement.getDisplayValue()
                        });
                     }
				} 
				
				activitiesToReturn.push(updatedRecord);
			} else {
				return {
					errorType: 'UPDATE_FAILED',
					message: "Cannot find record for activity " + activity.sys_id + "."
				};
			}
		}
	} catch (error) {
		return {
			errorType: 'UPDATE_FAILED',
			message: error
		};
	}
	
	return activitiesToReturn;
})(env);
