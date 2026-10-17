var TargetProgressUtilSNC = Class.create();
TargetProgressUtilSNC.prototype = {
    initialize: function(targetGr) {
        this.targetGr = targetGr;
    },
    logTargetProgress: function(targetType) {
        if (!this.targetGr || !this.targetGr.isValid() || this.targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var progressFieldsToBeLogged = {};
        var progressFieldsToBeupdated = {};
        if (targetType == 'qualitative') {
            var qualitative_percent_complete = 0.0;
            if (this.targetGr.getValue('qualitative_actual_value') && this.targetGr.getValue('qualitative_target_value'))
                if (this.targetGr.getValue('qualitative_actual_value') == this.targetGr.getValue('qualitative_target_value')) {
                    qualitative_percent_complete = 100.0;
                }
            progressFieldsToBeLogged = {
                'goal': this.targetGr.getValue('goal'),
                'target': this.targetGr.getUniqueValue(),
				'qualitative_target_value': this.targetGr.getValue('qualitative_target_value'),
                'qualitative_progress_value': this.targetGr.getValue('qualitative_actual_value'),
                'percent_complete': qualitative_percent_complete,
				'status': this.targetGr.getValue('status'),
                'progress_date': new GlideDate()
            };
            progressFieldsToBeupdated = {
                'target': this.targetGr.getUniqueValue(),
				'qualitative_target_value': this.targetGr.getValue('qualitative_target_value'),
                'qualitative_progress_value': this.targetGr.getValue('qualitative_actual_value'),
				'status': this.targetGr.getValue('status'),
                'percent_complete': qualitative_percent_complete
            };
        } else if (targetType == 'quantitative') {
            progressFieldsToBeLogged = {
                'goal': this.targetGr.getValue('goal'),
                'target': this.targetGr.getUniqueValue(),
				'target_value': this.targetGr.getValue('target_value'),
                'progress_value': this.targetGr.getValue('actual_value'),
                'percent_complete': this.targetGr.getValue('percent_complete'),
				'status': this.targetGr.getValue('status'),
                'progress_date': new GlideDate()
            };
            progressFieldsToBeupdated = {
                'target': this.targetGr.getUniqueValue(),
				'target_value': this.targetGr.getValue('target_value'),
                'progress_value': this.targetGr.getValue('actual_value'),
				'status': this.targetGr.getValue('status'),
                'percent_complete': this.targetGr.getValue('percent_complete'),
            };
        }
        var targetProgressGr;
        targetProgressGr = this._getTodaysTargetProgressGr();
        if (targetProgressGr && targetProgressGr.isValid()) {
            for (var progressRecordField in progressFieldsToBeupdated) {
                if (progressRecordField && global.JSUtil.notNil(progressFieldsToBeupdated[progressRecordField]))
                    targetProgressGr.setValue(progressRecordField, progressFieldsToBeupdated[progressRecordField]);
            }
            return targetProgressGr.update();
        } else {
            targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
            targetProgressGr.initialize();
            for (var progressRecordField in progressFieldsToBeLogged) {
                if (progressRecordField && global.JSUtil.notNil(progressFieldsToBeLogged[progressRecordField]))
                    targetProgressGr.setValue(progressRecordField, progressFieldsToBeLogged[progressRecordField]);
            }
            return targetProgressGr.insert();
        }
    },
    _getTodaysTargetProgressGr: function() {
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetProgressGr.isValid()) {
            targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
            targetProgressGr.addQuery('progress_date', new GlideDate());
            if (GlidePluginManager.isActive("sn_gfa")) {
                targetProgressGr.addNullQuery("target_breakdown");
            }
            targetProgressGr.query();
            if (targetProgressGr.next())
                return targetProgressGr;
        }
        return null;
    },
    clearTargetProgress: function() {
        if (!this.targetGr || !this.targetGr.isValid() || this.targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetProgressGr.isValid()) {
            targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
            targetProgressGr.query();
            targetProgressGr.deleteMultiple();
        }
    },
    isProgressCaptured: function() {
        if (!this.targetGr || !this.targetGr.isValid() || this.targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetProgressGr.isValid()) {
            targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
            targetProgressGr.setLimit(1);
            targetProgressGr.query();
            if (targetProgressGr.hasNext())
                return true;
        }
        return false;
    },

    updateTargetProgressGoalWithNewTargetGoal: function() {
        if (!this.targetGr || !this.targetGr.isValid() || this.targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetProgressGr.isValid()) {
            targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
            targetProgressGr.query();
            while (targetProgressGr.next()) {
                targetProgressGr.setValue('goal', this.targetGr.getValue('goal'));
                targetProgressGr.update();
            }
        }
    },
    updateTargetProgressWithNewTargetValue: function(targetType) {
        if (!this.targetGr || !this.targetGr.isValid() || this.targetGr.getTableName() != GoalFrameworkConstants.GOAL_TARGET_TABLE)
            return;
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        if (targetProgressGr.isValid()) {
            targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
			if(targetProgressGr.isValidField("target_breakdown")){
				targetProgressGr.addNullQuery('target_breakdown');
			}
            targetProgressGr.query();
            while (targetProgressGr.next()) {
                var newPercentageComplete;
                var currentTargetValue;
                var currentBaseValue;
                var currentActualValue;
                if (targetType == 'quantitative') {
                    currentTargetValue = parseFloat(this.targetGr.getValue('target_value'));
                    currentBaseValue = parseFloat(this.targetGr.getValue('base_value'));
                    currentActualValue = parseFloat(targetProgressGr.getValue('progress_value'));
                    if (this.targetGr.getValue('type') == 'maximize')
                        newPercentageComplete = (currentActualValue - currentBaseValue) / (currentTargetValue - currentBaseValue);
                    else
                        newPercentageComplete = (currentBaseValue - currentActualValue) / (currentBaseValue - currentTargetValue);
                    targetProgressGr.setValue('percent_complete', newPercentageComplete * 100);
                    targetProgressGr.update();
                } else if (targetType == 'qualitative') {
                    currentTargetValue = this.targetGr.getValue('qualitative_target_value');
                    currentActualValue = this.targetGr.getValue('qualitative_actual_value');
                    newPercentageComplete = 0.0;
                    if (currentActualValue && currentTargetValue)
                        if (currentActualValue == currentTargetValue) {
                            newPercentageComplete = 100.0;
                        }
                    targetProgressGr.setValue('percent_complete', newPercentageComplete);
                    targetProgressGr.setValue('qualitative_progress_value', currentActualValue);
                    targetProgressGr.update();
                }
            }
        }
    },

    getLastActualUpdated: function() {
        var lastActualUpdatedTime;
        var targetProgressGr = new GlideRecord(GoalFrameworkConstants.GOAL_TARGET_PROGRESS_TABLE);
        targetProgressGr.addQuery('target', this.targetGr.getUniqueValue());
        targetProgressGr.orderByDesc('sys_updated_on');
        targetProgressGr.setLimit(1);
        targetProgressGr.query();
        if (targetProgressGr.next())
            lastActualUpdatedTime = targetProgressGr.sys_updated_on.getDisplayValue();
        return lastActualUpdatedTime;
    },
    type: 'TargetProgressUtilSNC'
};
