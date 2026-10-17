var ECCQueueStatsByECCAgent = Class.create();

ECCQueueStatsByECCAgent.prototype = {
	
	/***********************************************************************************************************/
	initialize: function() {
		this.TABLE_NAME__ECC_QUEUE_STATS_BY_ECC_AGENT = 'ecc_queue_stats_by_ecc_agent';
		this.AGENT_NAME_PREFIX = 'mid.server.';
		this.BROADCAST_AGENT_NAME = this.AGENT_NAME_PREFIX + '*';
		this.Metrics = Object.freeze({
			OLDEST_ENTRY_DATE: {aggregate: 'MIN', field: 'sys_updated_on', value: 'oldest_entry_date'},
			CURRENT_COUNT: {aggregate: 'COUNT', field: 'queue', value: 'current_count'},
			INTERVAL_COUNT: {aggregate: 'COUNT', field: 'queue', value: 'interval_count'},
			AVG_CREATED_ON: {aggregate: 'SUM', field: 'sys_created_on', value: 'avg_created_on'},
			AVG_PROCESSED: {aggregate: 'SUM', field: 'sys_updated_on', value: 'avg_processed'}
		});
		this.new_last_refreshed_date = new GlideDateTime();
		this.agents = {};                           // map of ECC Agent stats
		this.interval_duration_seconds = this._computeIntervalDurationSeconds();

		this.avg_age_ready_input = 0;
		this.avg_age_ready_output = 0;
		this.avg_age_processed_output = 0;
		this.avg_age_processed_input = 0;

	},
	/***********************************************************************************************************/
	refreshECCQueueStatsByECCAgent: function() {
		// Oldest entry date and current count metrics use the same query, so they are combined here
		var ga = this._query(this._computeQueryWindowStart(this.Metrics.OLDEST_ENTRY_DATE), this.Metrics.OLDEST_ENTRY_DATE);
		this._getValuesFromAggregate(ga, [this.Metrics.OLDEST_ENTRY_DATE, this.Metrics.CURRENT_COUNT]);

		ga = this._query(this._computeQueryWindowStart(this.Metrics.INTERVAL_COUNT), this.Metrics.INTERVAL_COUNT);
		this._getValuesFromAggregate(ga, [this.Metrics.INTERVAL_COUNT]);

		ga = this._queryAvg(this._computeQueryWindowStart(this.Metrics.AVG_CREATED_ON), [this.Metrics.AVG_CREATED_ON, this.Metrics.AVG_PROCESSED, this.Metrics.INTERVAL_COUNT]);
		this._getAvgValuesFromAggregate(ga, this.Metrics.AVG_CREATED_ON, this.Metrics.AVG_PROCESSED);

		this._updateOrInsertRecords();
	},
	/***********************************************************************************************************/
	/**
	 * Computes the interval_duration_seconds based on the last time this date was refreshed.
	 */
	_computeIntervalDurationSeconds: function() {
		var use_fixed_length_interval = JSUtil.toBoolean(gs.getProperty('glide.ecc_queue.stats.collect.use_fixed_length_interval','true'));

		if (use_fixed_length_interval)
			return parseInt(gs.getProperty('glide.ecc_queue.stats.collect.interval_duration_seconds','300'),10); // radix is 10

		var ga = new GlideAggregate(this.TABLE_NAME__ECC_QUEUE_STATS_BY_ECC_AGENT);

		// The most recent last_refreshed_date in our table
		ga.addAggregate('MAX', 'last_refreshed_date');
		ga.query();

		if (ga.next()) {
			var old_date = ga.getAggregate('MAX', 'last_refreshed_date');
			var old_date_gdt = new GlideDateTime(old_date);
			var old_date_millis = old_date_gdt.getNumericValue();
			var new_date = new GlideDateTime(this.new_last_refreshed_date);
			var new_date_millis = new_date.getNumericValue();
			var interval_duration_millis = new_date_millis - old_date_millis;
			this.interval_duration_seconds = interval_duration_millis / 1000;
		}
	},
	/***********************************************************************************************************/
	_computeQueryWindowStart: function(metric) {
		var duration = this._getQueryWindowDuration(metric);
		var start = new GlideDateTime(this.new_last_refreshed_date);
		start.subtract(duration.getNumericValue());

		// add some time to avoid joining more than 2 shards
		if (metric !== this.Metrics.INTERVAL_COUNT && metric !== this.Metrics.AVG_CREATED_ON && metric !== this.Metrics.AVG_PROCESSED)
			start.addSeconds(this.interval_duration_seconds * 2);

		return start;
	},
	/***********************************************************************************************************/
	/**
	 * returns a GlideDateTime which is the duration of the query window
	 *
	 */
	_getQueryWindowDuration: function(metric) {
		switch(metric) {
			case this.Metrics.INTERVAL_COUNT:
			case this.Metrics.AVG_CREATED_ON:
			case this.Metrics.AVG_PROCESSED:
				return new GlideDateTime('1970-01-01 00:05:00');
			case this.Metrics.CURRENT_COUNT:
			case this.Metrics.OLDEST_ENTRY_DATE:
			default:
				return new GlideDateTime('1970-01-01 04:00:00');  // 12 hours
		}
	},
	/**********************************************************************************************************/
	_query: function(query_window_start, metric) {
		var ga = new GlideAggregate('ecc_queue');

		ga.addQuery('sys_created_on', '>', query_window_start);
		ga.addQuery('sys_updated_on', '<=', new GlideDateTime());

		ga.addQuery('agent', 'STARTSWITH', this.AGENT_NAME_PREFIX);
		ga.addQuery('agent', '!=', this.BROADCAST_AGENT_NAME);

		ga.groupBy('agent');
		ga.groupBy('state');
		ga.groupBy('queue');

		ga.addAggregate('COUNT', 'queue');

		if (metric === this.Metrics.OLDEST_ENTRY_DATE || metric === this.Metrics.CURRENT_COUNT) {
			ga.addAggregate('MIN', 'sys_updated_on');
		}

		ga.query();
		return ga;
	},
	_queryAvg: function(query_window_start, metricsArr) {
		var ga = new GlideAggregate('ecc_queue');

		//gs.info('_queryAvg::start time in avg: '+ query_window_start);
		//gs.info('_queryAvg::end time in avg: '+ this.new_last_refreshed_date);
		ga.addQuery('sys_created_on', '>', query_window_start);
		ga.addQuery('sys_updated_on', '<=', this.new_last_refreshed_date);

		ga.addQuery('agent', 'STARTSWITH', this.AGENT_NAME_PREFIX);
		ga.addQuery('agent', '!=', this.BROADCAST_AGENT_NAME);
		ga.addQuery('state', '!=', 'processing');

		ga.groupBy('agent');
		ga.groupBy('state');
		ga.groupBy('queue');

		for (var i = 0; i < metricsArr.length; i++) {
			var metric = metricsArr[i];
			ga.addAggregate(metric.aggregate, metric.field);
		}

		ga.query();
		return ga;
	},
	/**********************************************************************************************************/
	_getValuesFromAggregate: function(ga, metricsArr) {
		while (ga.next()) {
			var agent = ga.getValue('agent');
			var state = ga.getValue('state');
			var queue = ga.getValue('queue');

			if (JSUtil.nil(agent) || JSUtil.nil(state) || JSUtil.nil(queue)) {
				gs.warn('ECCQueueStatsByECCAgent._getValuesFromAggregate() found nil values');
				continue;
			}

			for (var i = 0; i < metricsArr.length; i++) {
				var metric = metricsArr[i];
				var agg = metric.aggregate;
				this.agents[agent] = this.agents[agent] || {};
				this.agents[agent][queue] = this.agents[agent][queue] || {};
				this.agents[agent][queue][state] = this.agents[agent][queue][state] || {};
				this.agents[agent][queue][state][metric.value] = ga.getAggregate(metric.aggregate, metric.field);
			}
		}
	},

	_getAvgValuesFromAggregate: function(ga, metricsAvg, metricCreated) {
		while (ga.next()) {
			var agent = ga.getValue('agent');
			var state = ga.getValue('state');
			var queue = ga.getValue('queue');

			if (JSUtil.nil(agent) || JSUtil.nil(state) || JSUtil.nil(queue)) {
				gs.warn('ECCQueueStatsByECCAgent._getValuesFromAggregate() found nil values');
				continue;
			}
			var sum_processed = ga.getAggregate('SUM', 'sys_updated_on');
			var sum_created = ga.getAggregate('SUM', 'sys_created_on');
			var count =  ga.getAggregate('COUNT', 'queue');
			var processed_sum_age = new GlideDateTime(sum_processed);
			var created_sum_age = new GlideDateTime(sum_created);
			if (state == 'processed') {
				if (sum_processed != null && sum_created != null) {
					this.agents[agent][queue][state]['avg_age'] = (processed_sum_age.getNumericValue() - created_sum_age.getNumericValue())/count;
				} else {
					this.agents[agent][queue][state]['avg_age'] = 0;
				}
			}

			if (state == 'ready') {
				if (sum_created != null) {
					this.agents[agent][queue][state]['avg_age'] = (new GlideDateTime().getNumericValue() - (created_sum_age.getNumericValue()/count));
				} else {
					this.agents[agent][queue][state]['avg_age'] = 0;
				}
			}
		}
	},



    /***********************************************************************************************************/
	_updateOrInsertRecords: function() {
		var agents = Object.keys(this.agents);

		for (var i=0; i < agents.length; i++) {
			var agentName = agents[i];
			// Skip if nil agent name
			if (!agentName)
				continue;

            var agentObj = this.agents[agentName];
            // Skip if data wasn't populated
			if (!agentObj)
				continue;

            var eccQueueStatsGr = new GlideRecord(this.TABLE_NAME__ECC_QUEUE_STATS_BY_ECC_AGENT);
            eccQueueStatsGr.addQuery('agent', agentName);
            eccQueueStatsGr.query();

            if (eccQueueStatsGr.next()) {
                this._updateRecord(eccQueueStatsGr, agentObj);
            } else {
                this._insertRecord(agentName, agentObj);
            }
        }
    },
    /***********************************************************************************************************/
    _updateRecord: function(eccQueueStatsGr, agentObj) {
		this._lookupAndSetValuesOnGlideRecord(eccQueueStatsGr, agentObj);
		eccQueueStatsGr.update();
	},
    /***********************************************************************************************************/
    _insertRecord: function(agentName, agentObj) {
		var toInsert = new GlideRecord(this.TABLE_NAME__ECC_QUEUE_STATS_BY_ECC_AGENT);
		toInsert.initialize();

		toInsert.setValue('agent', agentName);
		this._lookupAndSetValuesOnGlideRecord(toInsert, agentObj);

		toInsert.insert();
	},

	_resetAverageData: function(eccQueueStatsGr) {
		if (!eccQueueStatsGr)
			return;
		eccQueueStatsGr.setValue('avg_age_processed_input', this.avg_age_processed_input);
		eccQueueStatsGr.setValue('avg_age_processed_output', this.avg_age_processed_output);
		eccQueueStatsGr.setValue('avg_age_ready_input', this.avg_age_ready_input);
		eccQueueStatsGr.setValue('avg_age_ready_output', this.avg_age_ready_output);
		eccQueueStatsGr.setValue('current_count_ready_input', 0);
		eccQueueStatsGr.setValue('current_count_ready_output', 0);
		eccQueueStatsGr.setValue('current_count_processed_input', 0);
		eccQueueStatsGr.setValue('current_count_processed_output', 0);
		eccQueueStatsGr.setValue('current_count_processing_input', 0);
		eccQueueStatsGr.setValue('current_count_processing_output', 0);
		return eccQueueStatsGr;
	},

    /***********************************************************************************************************/
    _lookupAndSetValuesOnGlideRecord: function(eccQueueStatsGr, agentObj) {
		eccQueueStatsGr.setValue('last_refreshed_date', this.new_last_refreshed_date);
		eccQueueStatsGr.setValue('interval_duration_seconds', this.interval_duration_seconds);
		eccQueueStatsGr = this._resetAverageData(eccQueueStatsGr);
		for (queue in agentObj) {
			for (state in agentObj[queue]) {
				for (metric in agentObj[queue][state]) {
					var val = agentObj[queue][state][metric];
					eccQueueStatsGr.setValue('' + metric + '_' + state + '_' + queue, val);
				}
			}
		}
	},
	/***********************************************************************************************************/

	type: 'ECCQueueStatsByECCAgent'
};
