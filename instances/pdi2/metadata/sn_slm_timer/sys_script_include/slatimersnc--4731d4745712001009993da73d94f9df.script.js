var SLATimerSNC = Class.create();

SLATimerSNC.LOG_PROP = 'com.snc.sla.timer.log';
SLATimerSNC.FIRST_TO_BREACH = 1;
SLATimerSNC.MAPPING = 2;
SLATimerSNC.INVALID_IDS = 'invalid_ids';
SLATimerSNC.INVALID_TASK_IDS = 'invalid_task_ids';
SLATimerSNC.INVALID_CONFIG_IDS = 'invalid_config_ids';
SLATimerSNC.DEFAULT_CONFIG_ID = 'DEFAULT_CONFIG_ID';
SLATimerSNC.SLA_TIMER_CONFIG_CACHE = 'sla_timer_config_cache';

SLATimerSNC.prototype = {
	initialize: function(_gr, _gs) {
		this._log = new global.GSLog(SLATimerSNC.LOG_PROP, this.type);

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[initialize] type: ' + this.type);

		this._gr = _gr;
		this._gs = _gs || gs;
		this._slaUtil = new global.SLAUtil();

		this._isTwentyElevenEngine = this._gs.getProperty('com.snc.sla.engine.version', '2010') === '2011';
		this._isBreachCompatibility = this._gs.getProperty('com.snc.sla.compatibility.breach', false) + '' === 'true';

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[initialize] isTwentyElevenEngine: ' + this._isTwentyElevenEngine + ' isBreachCompatibility: ' + this._isBreachCompatibility);
	},

	get: function(params) {
		var timerData = {
			sla_timers: {},
			config: {}
		};

		if (!params)
			return timerData;

		var taskSysIds = params.task_ids || '';
		var configSysIds = params.config_ids || '';

		if (!taskSysIds || (Array.isArray(taskSysIds) && taskSysIds.length < 1))
			return timerData;

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[get] taskSysIds: ' + taskSysIds + ' configSysIds: ' + configSysIds);

		var uniqueTaskSysIds = this._uniqueSysIds(taskSysIds);
		var uniqueConfigSysIds = this._uniqueSysIds(configSysIds);

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[get] uniqueTaskSysIds: ' + uniqueTaskSysIds + ' uniqueConfigSysIds: ' + uniqueConfigSysIds);

		var hasValidTaskIds = uniqueTaskSysIds && Array.isArray(uniqueTaskSysIds) && uniqueTaskSysIds.length > 0;
		var hasValidConfigIds = uniqueConfigSysIds && Array.isArray(uniqueConfigSysIds) && uniqueConfigSysIds.length > 0;

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[get] hasValidTaskIds: ' + hasValidTaskIds + ' hasValidConfigIds: ' + hasValidConfigIds);

		if (!hasValidTaskIds)
			return timerData;

		// Refresh all Task SLA records
		this._slaUtil.refreshTaskSlasByTask(uniqueTaskSysIds);

		// Get all task SLA data records
		timerData.sla_timers = this._getTaskSlaData(uniqueTaskSysIds);

		// Get all the config data records
		if (!uniqueConfigSysIds || !Array.isArray(uniqueConfigSysIds) || uniqueConfigSysIds.length < 1)
			timerData.config = this._getDefaultConfig(uniqueTaskSysIds);
		else
			timerData.config = this._getConfig(uniqueTaskSysIds, uniqueConfigSysIds);

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[get] timerData: ' + JSON.stringify(timerData));

		return timerData;
	},

	getTargetEncQuery: function(configGr) {
		if (
			!configGr ||
			configGr.getValue('sla_timer_source') !== SLATimerSNC.FIRST_TO_BREACH + '' ||
			configGr.getValue('advanced_condition') === false
		) return null;

		var target = configGr.getValue('target');
		if (target === null)
			return null;

		var gr = new GlideRecord('sla_timer_config');
		gr.addQuery('target', target);
		return gr.getEncodedQuery();
	},

	_uniqueSysIds: function(sysIds) {
		sysIds = typeof sysIds === 'string' ? sysIds.split(',') : sysIds;
		sysIds = sysIds.filter(function(element) { return element || false; });
		return Array.isArray(sysIds) ? sysIds.filter(this.filters.unique) : sysIds;
	},

	// returns first to breach with show complete and cancel both true
	_getDefaultConfig: function(taskSysIds) {

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getDefaultConfig] taskSysIds: ' + taskSysIds);

		var configData = {};

		if (!taskSysIds || !Array.isArray(taskSysIds) || taskSysIds.length < 1)
			return configData;

		configData[SLATimerSNC.DEFAULT_CONFIG_ID] = {
			name: {
				display_value: this._gs.getMessage('DEFAULT Configuration'),
				value: SLATimerSNC.DEFAULT_CONFIG_ID
			}
		};

		taskSysIds.forEach(function(taskSysId) {
			var firstToBreachSysId = this._getFirstToBreach(taskSysId, true, true);

			if (firstToBreachSysId)
				configData[SLATimerSNC.DEFAULT_CONFIG_ID][taskSysId] = firstToBreachSysId;
		}, this);

		return configData;
	},

	_getConfig: function(taskSysIds, configSysIds) {
		var configData = {};

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getConfig] taskSysIds: ' + taskSysIds + ' configSysIds: ' + configSysIds);

		if (!taskSysIds || !Array.isArray(taskSysIds) || taskSysIds.length < 1 || !configSysIds || !Array.isArray(configSysIds) || configSysIds.length < 1)
			return configData;

		configSysIds.forEach(function(configSysId) {
			var config = this._getTimerConfig(configSysId);
			if (config) {
				configData[configSysId] = config;

				if (config.slaTimeSource === SLATimerSNC.FIRST_TO_BREACH) {
					taskSysIds.forEach(function(taskSysId) {
						var firstToBreachSysId = this._getFirstToBreach(taskSysId, config.showCompleted, config.showCancelled, config.condition);

						if (firstToBreachSysId)
							configData[configSysId][taskSysId] = firstToBreachSysId;
					}, this);
				} else if (config.slaTimeSource === SLATimerSNC.MAPPING) {
					taskSysIds.forEach(function(taskSysId) {
						var mappedTaskSlaSysId = this._getMapping(configSysId, taskSysId, config);

						if (mappedTaskSlaSysId)
							configData[configSysId][taskSysId] = mappedTaskSlaSysId;
					}, this);
				}
			}
		}, this);

		return configData;
	},

	_getTimerConfig: function(configSysId) {
		configSysId = configSysId || '';

		if (!configSysId)
			return null;

		var key = this._getCacheKey(configSysId);
		var configDataStr = sn_scoped_cache.ScopedCacheManager.get(SLATimerSNC.SLA_TIMER_CONFIG_CACHE, key);

		if (configDataStr)
			return JSON.parse(configDataStr);

		var configData = {};

		var configGr = new GlideRecord('sla_timer_config');
		configGr.addQuery('sys_id', configSysId);
		configGr.addActiveQuery();
		configGr.query();
		if (configGr.next()) {
			configData.name = {
				display_value: configGr.name.getDisplayValue(),
				value: configGr.getValue('name')
			};

			configData.showCompleted = !!(parseInt(configGr.getValue('show_complete')));
			configData.showCancelled = !!(parseInt(configGr.getValue('show_cancelled')));
			configData.showActualTime = !!(parseInt(configGr.getValue('show_actual_time')));

			var slaTimeSource = configGr.getValue('sla_timer_source');
			if (!isNaN(slaTimeSource))
				slaTimeSource = parseInt(slaTimeSource);

			configData.slaTimeSource = slaTimeSource;
			configData.condition = configGr.getValue('condition') || '';

			if (configGr.getValue('sla_timer_source') === SLATimerSNC.MAPPING + '')
				configData.__mappings = this._getConfigMapping(configSysId);

		} else {

			if (this._log.atLevel(global.GSLog.WARNING)) 
				this._log.warn('[_getTimerConfig] The following SLA Timer configuration do not exist: ' + configSysId);

			return null;
		}

		configDataStr = JSON.stringify(configData);
		sn_scoped_cache.ScopedCacheManager.put(SLATimerSNC.SLA_TIMER_CONFIG_CACHE, key, configDataStr);

		return JSON.parse(configDataStr);
	},

	_getTaskSlaData: function(taskSysIds) {
		var slaTimerData = {};
		var taskSlaGr = new GlideRecord('task_sla');
		taskSlaGr.addQuery('task', 'IN', taskSysIds);
		taskSlaGr.query();

		var validTasks = [];

		while (taskSlaGr.next()) {
			if (taskSlaGr.canRead()) {
				var taskSlaSysId = taskSlaGr.getUniqueValue();
				validTasks.push(taskSlaGr.getValue('task'));

				slaTimerData[taskSlaSysId] = {};

				var contractSlaGr = this._slaUtil.getSLADefinitionFromTaskSLA(taskSlaGr);

				slaTimerData[taskSlaSysId].sys_id = {
					value: taskSlaSysId,
					display_value: contractSlaGr.getDisplayValue()
				};

				slaTimerData[taskSlaSysId].task = {
					value: taskSlaGr.getValue('task'),
					display_value: taskSlaGr.task.getDisplayValue()
				};

				var scheduleData = this._slaUtil.getScheduleData(taskSlaGr);
				var durationType = contractSlaGr.duration_type + '';
				var fullActualDurationInMillis;
				var fullBusinessDurationInMillis;

				// Duration type returns sys_id of relative duration if one is chosen or null for user specified duration
				if (durationType) {
					// support property com.snc.sla.always_populate_business_fields=false
					var elapsedActualTimeInMillis = this._durationInMillis(taskSlaGr.getValue('duration'));
					var remainingActualTimeInMillis = this._durationInMillis(taskSlaGr.getValue('time_left'));
					fullActualDurationInMillis = elapsedActualTimeInMillis + remainingActualTimeInMillis;

					if (scheduleData) {
						var elapsedBusinessTimeInMillis = this._durationInMillis(taskSlaGr.getValue('business_duration'));
						var remainingBusinessTimeInMillis = this._durationInMillis(taskSlaGr.getValue('business_time_left'));
						fullBusinessDurationInMillis = elapsedBusinessTimeInMillis + remainingBusinessTimeInMillis;

						slaTimerData[taskSlaSysId].businessDuration = {
							value: fullBusinessDurationInMillis,
							display_value: fullBusinessDurationInMillis
						};
					}

				} else {
					fullActualDurationInMillis = this._durationInMillis(contractSlaGr.duration + '');
					fullBusinessDurationInMillis = fullActualDurationInMillis;
				}

				slaTimerData[taskSlaSysId].duration = {
					value: fullActualDurationInMillis,
					display_value: fullActualDurationInMillis
				};

				// support property com.snc.sla.always_populate_business_fields=false
				var actualTimeLeftValue = this._durationInMillis(taskSlaGr.getValue('time_left'));
				var actualTimeLeftDisplayValue = taskSlaGr.time_left.getDisplayValue();

				slaTimerData[taskSlaSysId].time_left = {
					value: actualTimeLeftValue,
					display_value: actualTimeLeftDisplayValue
				};

				if (scheduleData) {
					// Adjust for difference between business_percentage and business_time_left calculations
					var calculatedTimeLeft = fullBusinessDurationInMillis - this._durationInMillis(taskSlaGr.getValue('business_duration'));
					var businessTimeLeftValue = Math.max(calculatedTimeLeft, this._durationInMillis(taskSlaGr.getValue('business_time_left')));

					var businessTimeLeftDuration = new GlideDuration(businessTimeLeftValue);
					var businessTimeLeftDisplayValue = businessTimeLeftDuration.getDisplayValue();

					slaTimerData[taskSlaSysId].businessTimeLeft = {
						value: businessTimeLeftValue,
						display_value: businessTimeLeftDisplayValue
					};

					slaTimerData[taskSlaSysId].businessDuration = {
						value: fullBusinessDurationInMillis,
						display_value: fullBusinessDurationInMillis
					};

					slaTimerData[taskSlaSysId].schedule = scheduleData;
				}

				slaTimerData[taskSlaSysId].sla = {
					value: taskSlaGr.getValue('sla'),
					display_value: contractSlaGr.getDisplayValue()
				};

				slaTimerData[taskSlaSysId].stage = {
					value: taskSlaGr.getValue('stage'),
					display_value: taskSlaGr.stage.getDisplayValue()
				};

				slaTimerData[taskSlaSysId].has_breached = {
					value: !!(parseInt(taskSlaGr.getValue('has_breached'))),
					display_value: taskSlaGr.has_breached.getDisplayValue()
				};

				slaTimerData[taskSlaSysId].target = {
					value: contractSlaGr.target + '',
					display_value: contractSlaGr.target.getDisplayValue()
				};

				if (slaTimerData[taskSlaSysId].has_breached.value)
					slaTimerData[taskSlaSysId].breach_time = {
						value: taskSlaGr.getValue('planned_end_time'),
						display_value: taskSlaGr.planned_end_time.getDisplayValue()
					};

				slaTimerData[taskSlaSysId].end_time = {
					value: taskSlaGr.getValue('end_time'),
					display_value: taskSlaGr.end_time.getDisplayValue()
				};
			}
		}

		var invalidTasks = taskSysIds.filter(function(taskSysId) {
			return validTasks.indexOf(taskSysId) === -1;
		});

		if (invalidTasks.length > 0 && this._log.atLevel(global.GSLog.WARNING))
			this._log.warn('[_getTaskSlaData] The following tasks are either invalid or have no associated SLAs: ' + invalidTasks.join(', '));

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTaskSlaData] slaTimerData: ' + JSON.stringify(slaTimerData));

		return slaTimerData;
	},

	// For a given task return the task_sla to breach first
	_getFirstToBreach: function(taskSysId, showCompleted, showCancelled, condition) {

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getFirstToBreach] taskSysId: ' + taskSysId + ', condition: ' + condition);

		if (!taskSysId)
			return '';

		var taskSlaGr = new GlideRecordSecure('task_sla');
		taskSlaGr.addQuery('task', taskSysId);

		if (condition) {
			var contractSlaSysIds = [];
			var contractSlaGr = new GlideRecordSecure('contract_sla');
			contractSlaGr.addEncodedQuery(condition);
			contractSlaGr.query();
			while (contractSlaGr.next())
				contractSlaSysIds.push(contractSlaGr.getUniqueValue());

			if (this._log.atLevel(global.GSLog.DEBUG))
				this._log.debug('[_getFirstToBreach] contractSlaSysIds: ' + contractSlaSysIds);

			taskSlaGr.addQuery('sla', 'IN', contractSlaSysIds);
		}

		taskSlaGr.orderBy('planned_end_time');
		taskSlaGr.orderBy('sys_id'); // Ensure consistent ordering

		var firstToBreachSysId = this._getTaskSla(taskSlaGr, showCompleted, showCancelled);

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getFirstToBreach] firstToBreachSysId: ' + firstToBreachSysId);

		return firstToBreachSysId;
	},

	_getMapping: function(configSysId, taskSysId, config) {
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getMapping] configSysId: ' + configSysId + ' taskSysId: ' + taskSysId);

		if (!configSysId || !taskSysId || !config)
			return '';

		var taskSlaSysId = '';

		var configMappings = config.__mappings;
		if (!configMappings || !Array.isArray(configMappings) || configMappings.length < 1)
			return taskSlaSysId;

		var table = this._getTableName(taskSysId);

		for (var i = 0; i < configMappings.length; i++) {
			var configMapping = configMappings[i];
			if (configMapping.table !== table)
				continue;

			var taskSlaGr = new GlideRecordSecure('task_sla');
			taskSlaGr.addQuery('task', taskSysId);
			taskSlaGr.addQuery('sla', configMapping.sla);
			taskSlaGr.orderBy('sys_id');

			taskSlaSysId = this._getTaskSla(taskSlaGr, config.showCompleted, config.showCancelled);
			if (taskSlaSysId)
				break;
		}

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getMapping] taskSlaSysId: ' + taskSlaSysId);

		return taskSlaSysId;
	},

	_getConfigMapping: function(configSysId) {
		var configMappings = [];
		configSysId = configSysId || '';
		if (!configSysId)
			return configMappings;

		var configMapGr = new GlideRecord('sla_timer_config_mapping');
		configMapGr.addQuery('config', configSysId);
		configMapGr.addActiveQuery();
		configMapGr.orderBy('order');
		configMapGr.orderBy('sys_id');
		configMapGr.query();
		while (configMapGr.next()) {
			var configMapping = {};
			configMapping.name = configMapGr.getDisplayValue();
			configMapping.order = configMapGr.order + '';
			configMapping.table = configMapGr.table + '';
			configMapping.sla = configMapGr.sla + '';
			configMapping.config = configMapGr.config + '';
			configMappings.push(configMapping);
		}

		return configMappings;
	},

	_getTaskSla: function(taskSlaGr, showCompleted, showCancelled) {

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTaskSla] showCompleted: ' + showCompleted + ' showCancelled: ' + showCancelled);

		var stageComplete = this._getStageComplete();

		// Modify query based on should Completed and Cancelled Task SLAs be shown and run it
		this._modifyQueryForCompletedCancelled(taskSlaGr, showCompleted, showCancelled);

		var taskSlasByStage = {
			in_progress: null,
			paused: null,
			breached_in_progress: null,
			breached: null,
			breached_paused: null
		};

		if (showCompleted)
			taskSlasByStage.completed = null;

		if (showCancelled)
			taskSlasByStage.cancelled = null;

		taskSlaGr.query();

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTaskSla] encodedQuery: ' + taskSlaGr.getEncodedQuery());

		var taskSlaSysId = '';

		while (taskSlaGr.next()) {
			var stageValue = taskSlaGr.getValue('stage');
			taskSlaSysId = taskSlaGr.getUniqueValue();
			var isBreached = this._isBreached(taskSlaGr);

			if (this._log.atLevel(global.GSLog.DEBUG))
				this._log.debug('[_getTaskSla] stageValue: ' + stageValue + ' isBreached: ' + isBreached);

			// in_progress and paused stages should return non-breached Task SLAs as they are more important
			if (!isBreached) {
				if (stageValue === 'in_progress' && !taskSlasByStage.in_progress) {
					taskSlasByStage.in_progress = taskSlaSysId;
					break;
				}

				if (stageValue === 'paused' && !taskSlasByStage.paused)
					taskSlasByStage.paused = taskSlaSysId;
			} else {
				// Breached Task SLAs should follow the same hierarchy of stages as non-breached
				if (stageValue === 'in_progress' && !taskSlasByStage.breached_in_progress)
					taskSlasByStage.breached_in_progress = taskSlaSysId;

				if (stageValue === 'breached' && !taskSlasByStage.breached)
					taskSlasByStage.breached = taskSlaSysId;

				if (stageValue === 'paused' && !taskSlasByStage.breached_paused)
					taskSlasByStage.breached_paused = taskSlaSysId;
			}

			// For Completed and Cancelled stages we do not care is Task SLA breached or not
			if (showCompleted && stageValue === stageComplete && !taskSlasByStage.completed)
				taskSlasByStage.completed = taskSlaSysId;

			if (showCancelled && stageValue === 'cancelled' && !taskSlasByStage.cancelled)
				taskSlasByStage.cancelled = taskSlaSysId;

			// Stop iterating through Task SLA records if each stage has been filled
			var unfilledStages = Object.keys(taskSlasByStage).filter(function(key) {
				return !taskSlasByStage[key];
			});

			if (unfilledStages.length === 0)
				break;
		}

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTaskSla] taskSlasByStage: ' + JSON.stringify(taskSlasByStage));

		taskSlaSysId = taskSlasByStage.in_progress || taskSlasByStage.paused || taskSlasByStage.breached_in_progress || taskSlasByStage.breached || taskSlasByStage.breached_paused || taskSlasByStage.completed || taskSlasByStage.cancelled || null;

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTaskSla] taskSlaSysId: ' + taskSlaSysId);

		return taskSlaSysId;
	},

	_modifyQueryForCompletedCancelled: function(taskSlaGr, showCompleted, showCancelled) {
		var excludedStages = [];
		var stageComplete = this._getStageComplete();

		if (!showCompleted)
			excludedStages.push(stageComplete);

		if (!showCancelled)
			excludedStages.push('cancelled');

		if (!stageComplete.length)
			taskSlaGr.addQuery('stage', 'NOT IN', excludedStages.join(','));
	},

	_isBreached: function(taskSlaGr) {
		return taskSlaGr.getValue('has_breached') === '1' || taskSlaGr.getValue('stage') === 'breached';
	},

	_getTableName: function(taskSysId) {
		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTableName] taskSysId: ' + taskSysId);

		if (!taskSysId)
			return '';

		var gr = new GlideRecord('task');
		if (!gr.get(taskSysId))
			return '';

		var tablename = gr.getValue('sys_class_name');

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getTableName] tablename: ' + tablename);

		return tablename;
	},

	_getStageComplete: function() {
		var stageComplete = !this._isTwentyElevenEngine || this._isBreachCompatibility ? 'achieved' : 'completed';

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getStageComplete] stageComplete: ' + stageComplete);

		return stageComplete;
	},

	_durationInMillis: function(durationValue) {
		var duration = new GlideDuration();
		duration.setValue(durationValue);

		var durationInMillis = duration.getNumericValue();

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_durationInMillis] durationInMillis: ' + durationInMillis);

		return durationInMillis;
	},

	filters: {
		sysId: function(sysId) {
			return GlideStringUtil.isEligibleSysID(sysId);
		},

		unique: function(value, index, arr) {
			return arr.indexOf(value) === index;
		}
	},

	assign: function(target, varArgs) {
		if (target == null)
			throw new TypeError('Cannot convert undefined or null to object');

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) {
				for (var nextKey in nextSource) {
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey))
						to[nextKey] = nextSource[nextKey] + '';
				}
			}
		}
		return to;
	},

	_getCacheKey: function(key, hasTranslatedContent) {
		key = key || '';
		var domain = gs.getSession().getCurrentDomainID();
		if (global.JSUtil.nil(domain))
			domain = 'global';

		key += '^' + domain;

		if (hasTranslatedContent)
			key += '^' + gs.getSession().getLanguage() || gs.getProperty('glide.sys.language', 'en');

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[_getCacheKey] key: ' + key);

		return key;
	},

	type: 'SLATimerSNC'
};
