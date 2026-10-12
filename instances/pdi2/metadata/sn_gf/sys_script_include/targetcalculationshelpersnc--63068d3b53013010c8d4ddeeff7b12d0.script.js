var TargetCalculationsHelperSNC = Class.create();
TargetCalculationsHelperSNC.prototype = {
    initialize: function() {},

    setTargetPercentComplete: function(targetGr, targetType) {
        if (!targetGr || !targetGr.isValid() || targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var newPercentageComplete;
        var currentTargetValue;
        var currentBaseValue;
        var currentActualValue;
        if (targetType == 'quantitative') {
            currentTargetValue = parseFloat(targetGr.getValue('target_value'));
            currentBaseValue = parseFloat(targetGr.getValue('base_value'));
            currentActualValue = parseFloat(targetGr.getValue('actual_value'));
            if (currentActualValue == currentBaseValue && currentActualValue == currentTargetValue)
                newPercentageComplete = 1;
            else if (targetGr.getValue('type') == 'maximize')
                newPercentageComplete = (currentActualValue - currentBaseValue) / (currentTargetValue - currentBaseValue);
            else
                newPercentageComplete = (currentBaseValue - currentActualValue) / (currentBaseValue - currentTargetValue);

            targetGr.setValue('percent_complete', newPercentageComplete * 100);
        } else if (targetType == 'qualitative') {
			currentTargetValue = targetGr.getValue('qualitative_target_value');
            currentActualValue = targetGr.getValue('qualitative_actual_value');
			newPercentageComplete = 0.0;
			if (currentActualValue && currentTargetValue)
				if (currentActualValue == currentTargetValue)
					newPercentageComplete = 100.0;
			targetGr.setValue('percent_complete', newPercentageComplete);
        }

    },

    type: 'TargetCalculationsHelperSNC'
};
