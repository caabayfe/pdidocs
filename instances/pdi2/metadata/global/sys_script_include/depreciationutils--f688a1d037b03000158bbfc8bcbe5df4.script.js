var DepreciationUtils = Class.create();
DepreciationUtils.prototype = {
	initialize: function() {
		this.jobLog = new global.AssetJobLogUtil();
		this.JOB_LOG_STEP_SIZE = 100000;
		this.STEP_COUNT = 1;
		this.CACHE_NAME = 'sn_itam_depreciation_formula';
		this.CACHE_KEY = 'CACHE_KEY';
		this.shouldUseCaching = gs.getProperty('sn_itam_enable_caching_for_depreciation') === 'true';
	},

	_getStepMessage: function() {
		return this.JOB_LOG_MESSAGES.JOB_STEP + " - " + this.STEP_COUNT;
	},
	
	JOB_LOG_MESSAGES: {
		JOB_LOG_MESSAGE: 'Asset - Calculate Depreciation Job',
		JOB_STATUS_COMPLETED: new AssetJobLogUtil().COMPLETED_STATUS,
		JOB_STEP: 'Processing Depreciation on Asset records'
	},

	calcDepreciation: function(gr, useCaching) {
		var gc = GlideController;
		gc.putGlobal('asset', gr);
		var script;
		if (useCaching) {
			script = this.getCachedValue(String(gr.depreciation));
		} else {
			script = gr.depreciation.script;
		}
		if(!gs.nil(script)) {
			var residual_value = gc.evaluateString(script);
			if (!gs.nil(residual_value) && !isNaN(residual_value)) {
				gr.residual = parseFloat(residual_value);
				gr.depreciated_amount = parseFloat(gr.cost)-parseFloat(residual_value);
				gr.residual_date = gs.now();
				gr.update();
			}
		}
	},
	
	calcAllDepreciation: function() {
		if (!this.shouldRunJob()) {
			return;
		}

		this.jobLog.startJobLog(this.JOB_LOG_MESSAGES.JOB_LOG_MESSAGE);
		this.putValuesInCache();

		var currentGDT = new GlideDateTime();

		var currentIndex = 0;
		var recordsProcessed = 0;

		var gr = new GlideRecord('alm_asset');
		gr.addQuery('depreciation', '!=', '');
		gr.addQuery('depreciation_date', '!=', '');
		gr.query();

		this.jobLog.startJobStep(this._getStepMessage());
		while (gr.next()){
			this.calcDepreciation(gr, this.shouldUseCaching);

			currentIndex++;
			recordsProcessed++;
			if (currentIndex % this.JOB_LOG_STEP_SIZE === 0) {
				this.jobLog.stopJobStep(this._getStepMessage(), 'Records processed : ' + recordsProcessed);
				if (gr.hasNext()){
					this.STEP_COUNT++;
					recordsProcessed = 0;
					this.jobLog.startJobStep(this._getStepMessage());
				}
			}
		}

		if (currentIndex % this.JOB_LOG_STEP_SIZE !== 0)
			this.jobLog.stopJobStep(this._getStepMessage(), 'Records processed : ' + recordsProcessed);
		this.jobLog.stopJobLog(this.JOB_LOG_MESSAGES.JOB_STATUS_COMPLETED,
			'Records processed : ' + currentIndex);
		
		// Set last run when job is complete
		gs.setProperty('sn_itam_depreciation_job_last_run', currentGDT.getDate());
		sn_scoped_cache.ScopedCacheManager.flushScopedCache(this.CACHE_NAME);
	},

	shouldRunJob: function() {
		var currentGDT = new GlideDateTime();
		var lastRunDate = gs.getProperty('sn_itam_depreciation_job_last_run');
		if (gs.nil(lastRunDate)) {
			return true;
		}
		var lastRunGDT = new GlideDateTime(lastRunDate);
		lastRunGDT.addDaysLocalTime(gs.getProperty('sn_itam_trigger_depreciation_job_after_days'));
		return currentGDT.onOrAfter(lastRunGDT);
	},

	putValuesInCache: function() {
		var valuesMap = {};
		var depGr = new GlideRecord('cmdb_depreciation');
		depGr.query();
		while(depGr.next()){
			valuesMap[depGr.getUniqueValue()] = String(depGr.script);
		}
		sn_scoped_cache.ScopedCacheManager.put(this.CACHE_NAME, this.CACHE_KEY, JSON.stringify(valuesMap));
	},

	getCachedValue: function(sysIdKey) {
		var valuesMap = JSON.parse(sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, this.CACHE_KEY));
		var res;
		if (gs.nil(valuesMap)) {
			this.putValuesInCache();
			valuesMap = JSON.parse(sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, this.CACHE_KEY));
		}
		if (Object.keys(valuesMap).indexOf(sysIdKey) === -1) {
			valuesMap = JSON.parse(sn_scoped_cache.ScopedCacheManager.get(this.CACHE_NAME, this.CACHE_KEY));

			var depGr = new GlideRecord('cmdb_depreciation');
			depGr.get(sysIdKey);
			valuesMap[sysIdKey] = String(depGr.script);
			sn_scoped_cache.ScopedCacheManager.put(this.CACHE_NAME, this.CACHE_KEY, JSON.stringify(valuesMap));
		}
		res = valuesMap[sysIdKey];
		return res;
	},
	
	type: 'DepreciationUtils'
};
