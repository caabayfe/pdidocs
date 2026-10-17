var MetricBaseTriggerUtils = Class.create();
MetricBaseTriggerUtils.prototype = {
	initialize: function(legacy) {
		if (legacy === true) {
			this.bandTriggerTableName = 'sys_metric_trigger';
			this.bandLevelTableName = 'sys_metric_trigger_level';
			this.windowFieldName = 'window';
			this.aggregatorFieldName = 'aggregator';
			this.valueFieldName = 'value';
			this.bandValueFieldName = 'band_value';
			this.toleranceFieldName = 'tolerance';
		} else {
			this.bandTriggerTableName = 'sys_metric_trigger_band';
			this.bandLevelTableName = 'sys_metric_trigger_level_band';
			this.windowFieldName = 'window_band';
			this.aggregatorFieldName = 'aggregator_band';
			this.valueFieldName = 'value_band';
			this.bandValueFieldName = 'band_value_band';
			this.toleranceFieldName = 'tolerance_band';
		}
	},

	validateBandTrigger: function(triggerGr) {
		var window = new GlideDateTime(triggerGr.getElement(this.windowFieldName)).getNumericValue();
		if (window == 0) {
			gs.addErrorMessage(gs.getMessage("Invalid window. Please enter a positive window value"));
			triggerGr.setAbortAction(true);
			return;
		}

		var metric = new GlideRecord('sys_metric');
		metric.get('sys_id', triggerGr.metric);

		var has_schedule = this._getRetentionPolicySchedule(triggerGr, metric);
		if (gs.nil(has_schedule))
			return;

		var schedule = new GlideRecord('sys_metric_schedule');
		schedule.get('sys_id', has_schedule.schedule);

		var period = new GlideDateTime(schedule.getElement('period')).getNumericValue();
		if (window % period != 0) {
			gs.addErrorMessage(gs.getMessage("Window value should be multiples of metric sampling period '{0}'", new GlideDuration(period).getDurationValue()));
			triggerGr.setAbortAction(true);
		}

		var max = gs.getProperty('glide.clotho.trigger.max_window');
		if (window / period > max) {
			gs.addErrorMessage(gs.getMessage("Window value '{0}' cannot be more than '{1}' times the sampling period '{2}'", [new GlideDuration(window).getDurationValue(), max, new GlideDuration(period).getDurationValue()]));
			triggerGr.setAbortAction(true);
		}
	},

	_getRetentionPolicySchedule: function(record, metric) {
		var has_schedule = new GlideRecord('sys_metric_policy_has_schedule');
		has_schedule.addQuery('retention_policy', metric.retention_policy);
		has_schedule.orderBy('schedule.period');
		has_schedule.setLimit(1);
		has_schedule.query();
		if (!has_schedule.next()) {
			gs.addErrorMessage(gs.getMessage("Unable to retrieve metric sampling period for metric '{0}'", metric.getDisplayValue()));
			record.setAbortAction(true);
			return null;
		}

		return has_schedule;
	},

	validateBandTriggerLevel: function(levelGr) {
		// function cannot be empty
		this._checkFunctionNotNone(levelGr);

		// clear the band value if no band function
		if (JSUtil.nil(levelGr.getValue('band_function')))
			levelGr.setValue(this.bandValueFieldName, '');

		// trigger values must be valid
		if (isNaN(parseFloat(levelGr.getValue(this.valueFieldName)))) {
			gs.addErrorMessage(gs.getMessage('Invalid limit value'));
			levelGr.setAbortAction(true);
		}

		if (JSUtil.notNil(levelGr.getValue('band_function')) && isNaN(parseFloat(levelGr.getValue(this.bandValueFieldName)))) {
			gs.addErrorMessage(gs.getMessage('Invalid limit value'));
			levelGr.setAbortAction(true);
		}

		// trigger level value cannot be 0
		this._checkLevelValueNotZero(levelGr);

		// trigger level value shall be unique
		this._checkLevelValueUnique(levelGr, this.bandLevelTableName);

		// trigger band shall not overlap an existing band
		var gr = new GlideRecord(this.bandLevelTableName);
		gr.addQuery('trigger', levelGr.trigger);
		gr.addQuery('sys_id', '!=', levelGr.sys_id);
		gr.query();
		while (gr.next()) {
			if (this._levelCollides(levelGr, gr)) {
				gs.addErrorMessage(gs.getMessage('The band defined by this level is colliding with level {0}', gr.level));
				levelGr.setAbortAction(true);
			}
		}
	},

	_checkFunctionNotNone: function(levelRecord) {
		if (JSUtil.nil(levelRecord.getValue('function'))) {
			gs.addErrorMessage(gs.getMessage('Function column cannot be empty'));
			levelRecord.setAbortAction(true);
		}
	},

	_checkLevelValueNotZero: function(levelRecord) {
		if (levelRecord.level == 0) {
			gs.addErrorMessage(gs.getMessage("Level zero is reserved, User can not use this"));
			levelRecord.setAbortAction(true);
		}
	},

	_checkLevelValueUnique: function(levelRecord, levelTableName) {
		var gr = new GlideRecord(levelTableName);
		gr.addQuery('trigger', levelRecord.trigger);
		gr.addQuery('level', levelRecord.level);
		gr.addQuery('sys_id', '!=', levelRecord.sys_id);
		gr.query();
		if (gr.hasNext()) {
			gs.addErrorMessage(gs.getMessage("Duplicate levels are not allowed. Level '{0}' already exists", levelRecord.level));
			levelRecord.setAbortAction(true);
		}
	},

	_levelCollides: function(level1, level2) {
		if (this._limitCollides(level1.getValue('function'), parseFloat(level1.getValue(this.valueFieldName)), level2))
			return true;

		if (JSUtil.notNil(level1.getValue('band_function')) && this._limitCollides(level1.getValue('band_function'), parseFloat(level1.getValue(this.bandValueFieldName)), level2))
			return true;

		if (this._limitCollides(level2.getValue('function'), parseFloat(level2.getValue(this.valueFieldName)), level1))
			return true;

		if (JSUtil.notNil(level2.getValue('band_function')) && this._limitCollides(level2.getValue('band_function'), parseFloat(level2.getValue(this.bandValueFieldName)), level1))
			return true;

		return false;
	},

	_limitCollides: function(operator, value, level) {
		var firstFunctionCollides = this._collides(operator, value, level.getValue('function'), parseFloat(level.getValue(this.valueFieldName)));
		var secondFunctionCollides = true;
		if (JSUtil.notNil(level.getValue('band_function')))
			secondFunctionCollides = this._collides(operator, value, level.getValue('band_function'), parseFloat(level.getValue(this.bandValueFieldName)));

		return firstFunctionCollides && secondFunctionCollides;
	},

	_collides: function(operator, value, limit_operator, limit) {
		if (value == limit) {
			if (operator == 'less')
				return limit_operator != 'moreorequals' && limit_operator != 'more';
			if (operator == 'more')
				return limit_operator != 'lessorequals' && limit_operator != 'less';
			if (operator == 'lessorequals')
				return limit_operator != 'more';
			if (operator == 'moreorequals')
				return limit_operator != 'less';
		}

		if (limit_operator == 'lessorequals' || limit_operator == 'less')
			return (value < limit);

		if (limit_operator == 'more' || limit_operator == 'moreorequals')
			return (value > limit);

		return false;
	},

	validateGapTriggerLevel: function(levelGr) {
		// function cannot be empty
		this._checkFunctionNotNone(levelGr);

		// function should be lessorequals
		if (levelGr.getValue('function') != 'moreorequals') {
			gs.addErrorMessage(gs.getMessage('Function can only be More than or is'));
			levelGr.setAbortAction(true);
		}

		// trigger window must be valid
		var window = new GlideDateTime(levelGr.getValue('value_gap')).getNumericValue();
		if (window <= 0) {
			gs.addErrorMessage(gs.getMessage("Invalid window. Please enter a positive window value"));
			levelGr.setAbortAction(true);
		}

		// trigger level value cannot be 0
		this._checkLevelValueNotZero(levelGr);

		// Trigger gap value should be greater than or equal to minimum trigger gap 'glide.clotho.trigger.gap.min_window'
		var metric = new GlideRecord('sys_metric');
		metric.get('sys_id', levelGr.trigger.metric);

		var has_schedule = this._getRetentionPolicySchedule(levelGr.trigger, metric);
		if (gs.nil(has_schedule))
			return;

		var schedule = new GlideRecord('sys_metric_schedule');
		schedule.get('sys_id', has_schedule.schedule);

		var period = new GlideDateTime(schedule.getElement('period')).getNumericValue();
		var gapTriggerMinWindow = gs.getProperty('glide.clotho.trigger.gap.min_window') * 60 * 1000;
		var minWindowGreaterThanPeriod = gapTriggerMinWindow >= period ? true : false;

		if (minWindowGreaterThanPeriod) {
			if (window < gapTriggerMinWindow) {
				gs.addErrorMessage(gs.getMessage("Invalid window value. Please enter a window value greater than or equal to trigger minimum window value of '{0}'", new GlideDuration(gapTriggerMinWindow).getDurationValue()));
				levelGr.setAbortAction(true);
			}
		} else if (window < period) {
			gs.addErrorMessage(gs.getMessage("Invalid window value. Please enter a window value greater than or equal to metric sampling period of '{0}'", new GlideDuration(period).getDurationValue()));
			levelGr.setAbortAction(true);
		}

		// Level Should be Uniue & GAP between two trigger level windows should be greater than or equal to the minimum trigger gap 'glide.clotho.trigger.gap.min_window'
		var currentLevel = levelGr.getValue('level');
		var gr = new GlideRecord('sys_metric_trigger_level_gap');
		gr.addQuery('trigger', levelGr.trigger);
		gr.addQuery('sys_id', '!=', levelGr.sys_id);
		gr.orderBy('value_gap');
		gr.query();
		while (gr.next()) {
			var triggerLevel = gr.getValue('level');
			if (triggerLevel == currentLevel) {
				gs.addErrorMessage(gs.getMessage("Duplicate levels are not allowed. Level '{0}' already exists", levelGr.level));
				levelGr.setAbortAction(true);
			}

			var triggerLevelGap = new GlideDateTime(gr.getValue('value_gap')).getNumericValue();
			var gapBetweenLevels = triggerLevelGap - window;
			gapBetweenLevels = -gapBetweenLevels > 0 ? -gapBetweenLevels : gapBetweenLevels; //Modulus function

			if (minWindowGreaterThanPeriod) {
				if (gapBetweenLevels < gapTriggerMinWindow) {
					gs.addErrorMessage(gs.getMessage("Invalid window. The window period difference between the two levels ({0} and {1}) should be greater than or equal to trigger minimum window value of '{2}'", [currentLevel, triggerLevel, new GlideDuration(gapTriggerMinWindow).getDurationValue()]));
					levelGr.setAbortAction(true);
				}
			} else if (gapBetweenLevels < period) {
				gs.addErrorMessage(gs.getMessage("Invalid window. The window period difference between the two levels ({0} and {1}) should be greater than or equal to metric sampling period of '{2}'",  [currentLevel, triggerLevel, new GlideDuration(period).getDurationValue()]));
				levelGr.setAbortAction(true);
			}
		}
	},

	validateLinearTrigger: function(triggerGr) {
		var confidence_interval = current.confidence_interval;
		if (confidence_interval <= 0 || confidence_interval > 100) {
			gs.addErrorMessage(gs.getMessage('Confidence Level value should be greater than 0 and less or equals to 100'));
			triggerGr.setAbortAction(true);
			return;
		}

		var metric = new GlideRecord('sys_metric');
		metric.get('sys_id', current.metric);

		var has_schedule = this._getRetentionPolicySchedule(triggerGr, metric);
		if (gs.nil(has_schedule))
			return;

		var schedule = new GlideRecord('sys_metric_schedule');
		schedule.get('sys_id', has_schedule.schedule);

		var period = new GlideDateTime(schedule.getElement('period')).getNumericValue();
		var window = new GlideDateTime(triggerGr.window_linear_predictor).getNumericValue();
		if (window % period != 0) {
			gs.addErrorMessage(gs.getMessage("Window value should be multiples of metric sampling period '{0}'", [new GlideDuration(period).getDurationValue()]));
			triggerGr.setAbortAction(true);
		}

		var min = gs.getProperty('glide.clotho.trigger.linear.predictor.min_window');
		if (window / period < min) {
			gs.addErrorMessage(gs.getMessage("Window value '{0}' cannot be less than '{1}' times the sampling period '{2}'", [new GlideDuration(window).getDurationValue(), min, new GlideDuration(period).getDurationValue()]));
			triggerGr.setAbortAction(true);
		}

		var max = gs.getProperty('glide.clotho.trigger.max_window');
		if (window / period > max) {
			gs.addErrorMessage(gs.getMessage("Window value '{0}' cannot be more than '{1}' times the sampling period '{2}'", [new GlideDuration(window).getDurationValue(), max, new GlideDuration(period).getDurationValue()]));
			triggerGr.setAbortAction(true);
		}
	},

	validateLinearTriggerLevel: function(levelGr) {
		// function cannot be empty
		this._checkFunctionNotNone(levelGr);

		// function should be lessorequals
		if (levelGr.getValue('function') != 'lessorequals') {
			gs.addErrorMessage(gs.getMessage('Function can only be Less than or is'));
			levelGr.setAbortAction(true);
		}

		// trigger window must be valid
		var window = new GlideDateTime(levelGr.getValue('value_linear_predictor')).getNumericValue();
		if (window <= 0) {
			gs.addErrorMessage(gs.getMessage("Invalid window. Please enter a positive window value"));
			levelGr.setAbortAction(true);
		}

		// trigger level value cannot be 0
		this._checkLevelValueNotZero(levelGr);

		// trigger level value shall be unique
		this._checkLevelValueUnique(levelGr, 'sys_metric_trigger_level_linear_predictor');

		// trigger window shall be unique
		var gr = new GlideRecord('sys_metric_trigger_level_linear_predictor');
		gr.addQuery('trigger', levelGr.trigger);
		gr.addQuery('value_linear_predictor', levelGr.value_linear_predictor);
		gr.addQuery('sys_id', '!=', levelGr.sys_id);
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage("Window already exists"));
			levelGr.setAbortAction(true);
		}
	},
	
	validateModelTriggerLevel: function(levelGr) {
		// function cannot be empty
		this._checkFunctionNotNone(levelGr);

		// function should be moreorequals
		if (levelGr.getValue('function') != 'moreorequals') {
			gs.addErrorMessage(gs.getMessage('Function can only be More than or is'));
			levelGr.setAbortAction(true);
		}

		// trigger level value cannot be 0
		this._checkLevelValueNotZero(levelGr);

        // trigger level value shall be unique
        this._checkLevelValueUnique(levelGr, 'sys_metric_trigger_level_model');
        
        // trigger value shall be unique
        var gr = new GlideRecord('sys_metric_trigger_level_model');
		gr.addQuery('trigger', levelGr.trigger.sys_id);
		gr.addQuery('value_model', levelGr.value_model);
		gr.addQuery('sys_id', '!=', levelGr.sys_id);
		gr.query();
		if (gr.next()) {
			gs.addErrorMessage(gs.getMessage("Duplicate values are not allowed. Value '{0}' already exists", levelGr.value_model));
			levelGr.setAbortAction(true);
		}
	},
	
	validateModelTrigger: function(triggerGr) {
		var direction = current.direction;
		if (direction != 'either' && direction != 'upward' && direction != 'downward') {
			gs.addErrorMessage(gs.getMessage('Spike Direction value must be upward, downward, or either.'));
			triggerGr.setAbortAction(true);
			return;
		}
		
		var model = current.model;
		var modelInstanceRecord = new GlideRecord('mb_model_instance');
		modelInstanceRecord.addQuery('mb_model', model);
		modelInstanceRecord.query();
		if (!modelInstanceRecord.next()){
			gs.addErrorMessage(gs.getMessage('The selected model does not have a model instance associated. Verify the model was successfully trained.'));
			triggerGr.setAbortAction(true);
		}
	},

	type: 'MetricBaseTriggerUtils'
};
