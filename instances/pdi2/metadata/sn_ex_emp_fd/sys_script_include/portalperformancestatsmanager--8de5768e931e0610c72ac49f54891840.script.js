var PortalPerformanceStatsManager = Class.create();
PortalPerformanceStatsManager.prototype = {
	initialize: function () {
		this.ENABLE_PERF_STAT_PROP = 'sn_ex_emp_fd.enable_performance_stat';
		this.OFFSET_TIME_WINDOW_PROP = 'sn_ex_emp_fd.performance_stat_time_window';
		this.enablePerfStat = this.sessionDebugStatus();
	},
	

	_sessionDebugStart: function() {
		var sessionDetails = gs.getSession();
		sessionDetails.putClientData('debug_ec_portal', true);

	},

	_sessionDebugStop: function() {
		var sessionDetails = gs.getSession();
		sessionDetails.putClientData('debug_ec_portal', false);

	},

	sessionDebugStatus: function() {
		var sessionDetails = gs.getSession();
		var debugStatus = sessionDetails.getClientData('debug_ec_portal');
		if (null === debugStatus) {
			debugStatus = false;
		}	
		return debugStatus;
	},
	/**
	 * API to enable stats logging
	 */
	enableLogging: function (silent) {
		this._sessionDebugStart();
		var strMesg = gs.getMessage('Portal performance statistics is enabled for the current session');
		if (silent !== true) {
			gs.addInfoMessage(strMesg);
		}		
		gs.info(strMesg);
	},
	
	/**
	 * API to disable stats logging
	 */
	disableLogging: function () {
		this._sessionDebugStop();
		gs.info('Portal performance statistics is disabled');
	},

	/**
	 * API to create performance stat record
	 * @param stats (destructured):
	 * stats {
	 * "parentId":"sys_id of the parent stat",
	 * "refRecordId":"sys_id of the record in play for which the stat is being posted",
	 * "refTable":"table name of the record in play for which the stat is being posted",
	 * "shortDesc":"descriptive one liner",
	 * }
	 */
	postStats: function (stats) {
		var portalPerfStatGr = new GlideRecord('sn_ex_emp_fd_portal_performance_stats');
		
		if (!this.sessionDebugStatus())
			return;

		var startTime = stats.startTime || new GlideDateTime();
		var callerTable = stats.callerTable || '';
		var textPrefix = stats.textPrefix || callerTable;
		var executionTime = parseInt(new GlideDateTime().getNumericValue() - startTime.getNumericValue());
		
		portalPerfStatGr.initialize();
		portalPerfStatGr.setValue('execution_time', executionTime);
		portalPerfStatGr.setValue('parent_id', stats.parentId || '');
		portalPerfStatGr.setValue('related_record', stats.refRecordId);
		portalPerfStatGr.setValue('related_record_table', stats.refTable);
		
		if (stats.guid) {
			portalPerfStatGr.setNewGuidValue(stats.guid);
		}
		if (!gs.nil(textPrefix)) {
			var shortDesc = !gs.nil(stats.shortDesc) ? textPrefix + ' - ' + stats.shortDesc : textPrefix;
			portalPerfStatGr.setValue('short_description', shortDesc);
		}

		portalPerfStatGr.setValue('ran_for_user', stats.userId || gs.getUserID());
		portalPerfStatGr.setValue('session_id', gs.getSessionID());

		portalPerfStatGr.setValue('caller_id', stats.callerId || '');
		portalPerfStatGr.setValue('caller_table', callerTable);
		
		portalPerfStatGr.insert();
	},
	/**
	 * API to cleanup the table records. 
	 */
	cleanup: function () {
		var portalPerfStatGr = new GlideRecord('sn_ex_emp_fd_portal_performance_stats');
		// get the record created before the starting of the week and delete them
		portalPerfStatGr.addEncodedQuery("sys_created_on<javascript:gs.beginningOfThisWeek()");
		portalPerfStatGr.query();
		portalPerfStatGr.deleteMultiple();
	},

	type: 'PortalPerformanceStatsManager',
};
