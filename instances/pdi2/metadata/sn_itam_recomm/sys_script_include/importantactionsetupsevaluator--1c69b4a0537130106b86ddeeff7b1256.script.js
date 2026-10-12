var ImportantActionSetupsEvaluator = Class.create();
ImportantActionSetupsEvaluator.prototype = Object.extendsObject(global.AssetManagementBaseJob, {
	initialize: function (dashboardSysIds, runInDomain, invokedFromRefresh, invokedFromJobWithID) {
		this.dashboardSysIds = dashboardSysIds;
		this.runInDomain = runInDomain;
		this.invokedFromRefresh = invokedFromRefresh;
		this.importantActionUtils = new sn_itam_recomm.ImportantActionUtils();

		this.SCHEDULE_ITEM = 'JOB RUNNING: ' + invokedFromJobWithID;

		var triggerID = null;
		if (invokedFromJobWithID) {
			new global.GlideQuery('sys_trigger')
				.where('document_key', invokedFromJobWithID)
				.selectOne('sys_id')
				.ifPresent(function (trigger) {
					triggerID = trigger.sys_id;
				});
		}

		if (!gs.nil(triggerID)) { this.SCHEDULE_ITEM = triggerID; }
	},

	/* *******************************************************************
		Process Setups
	******************************************************************* */

	clearJobTriggerOnDashboardResult: function (dashboardId) {
		this.importantActionUtils.upsertJobResultRecord(dashboardId, this.getCurrentDomainSysId(), '');
	},

	setJobTriggerOnDashboardResult: function (dashboardId) {
		this.importantActionUtils.upsertJobResultRecord(
			dashboardId,
			this.getCurrentDomainSysId(),
			this.SCHEDULE_ITEM
		);
	},

	processSetupsOfDashboard: function (dashboardSysId, setupIDs) {
		// Skip if a refresh is already running on dashboard
		if (!this.invokedFromRefresh
			&& this.importantActionUtils.isRefreshRunningOnDashboard(dashboardSysId, this.getCurrentDomainSysId())) {
			return;
		}

		// If refresh is invoked manually, sys_trigger would
		// already be stamped on the dashboard result.
		if (!this.invokedFromRefresh) { this.setJobTriggerOnDashboardResult(dashboardSysId); }

		var setupId;
		var setupGr = new GlideRecord('sn_itam_recomm_setup');
		for (var i in setupIDs) {
			setupId = setupIDs[i];

			setupGr.initialize();
			setupGr.get(setupId);
			if (setupGr.isValidRecord()) {
				this.importantActionUtils.evaluateSetupAndSaveResult(
					setupGr,
					this.getCurrentDomainSysId()
				);
			}
		}

		this.clearJobTriggerOnDashboardResult(dashboardSysId);
		this.importantActionUtils.updateLastCalculatedOnJobResultRecord(
			dashboardSysId,
			this.getCurrentDomainSysId()
		);
	},

	evaluateDashboardSetups: function (dashboardSetups) {
		for (var dashboardSysId in dashboardSetups) {
			this.processSetupsOfDashboard(dashboardSysId, dashboardSetups[dashboardSysId]);
		}
	},

	/* *******************************************************************
		Get Setups Per Dashboard (Unique)
	******************************************************************* */

	getSetupsPerDashboard: function () {
		var dashboardSysId;
		var dashboardSetups = [];
		var dashboardSetupId;
		var uniqueSetups = [];
		var uniqueSetupsPerDashboard = {};

		for (var i in this.dashboardSysIds) {
			dashboardSysId = this.dashboardSysIds[i];
			dashboardSetups = [];
			uniqueSetupsPerDashboard[dashboardSysId] = [];

			new global.GlideQuery('sn_itam_recomm_setup')
				.where('active', true)
				.where('dashboards', 'CONTAINS', dashboardSysId)
				.select('sys_id')
				.forEach(function (setup) { // eslint-disable-line
					dashboardSetups.push(setup.sys_id);
				});

			for (var j in dashboardSetups) {
				dashboardSetupId = dashboardSetups[j];
				if (uniqueSetups.indexOf(dashboardSetupId) === -1) {
					uniqueSetups.push(dashboardSetupId);
					uniqueSetupsPerDashboard[dashboardSysId].push(dashboardSetupId);
				}
			}
		}
		return uniqueSetupsPerDashboard;
	},

	/* *******************************************************************
		Main functions
	******************************************************************* */

	runJob: function () {
		var dashboardSetups = this.getSetupsPerDashboard();
		this.evaluateDashboardSetups(dashboardSetups);
	},

	getDomains: function () {
		if (this.runInDomain) { return [this.runInDomain]; }

		var domainsArray = ['global'];
		new global.GlideQuery('domain')
			.where('active', true)
			.select()
			.forEach(function (domain) {
				domainsArray.push(domain.sys_id);
			});
		return domainsArray;
	},

	type: 'ImportantActionSetupsEvaluator',
});
