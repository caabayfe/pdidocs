// Discovery class

/*
 * Starts Discovery jobs.
 */
var StartDiscovery = Class.create();

StartDiscovery.prototype = {

	initialize: function(source) {
		this.schedule = null;
		this.job = null;
		this.status = null;
		if (JSUtil.nil(source))
			this.source = 'Schedule_Discovery';
		else
			this.source = source;
	},

	_specificMid: function() {
		return 'specific_mid' === this.schedule.midSelMethod;
	},
	/*
    * A private method that cancels the discovery status and logs an error
    * @private
    */
	_cancelDiscoveryAndLogError: function() {
		// cancel the discovery and its running statuses
		(new SncDiscoveryCancel()).cancelAll(this.status.sysID);
		var msg = gs.getMessage('Discovery canceled on previously started schedule [{0}] due to mid not available\n', this.schedule.name);
		var dlog = new DiscoveryLogger(this.status.sysID);
		dlog.error(msg, 'StartDiscovery');
	},

	/*
 	* Invoked by the "Discovery" script include to kick off a scheduled (or "Discover Now") discovery.
 	* schedule: a GlideRecord with the instance of discovery_schedule that this discovery is based on
 	* job:      a GlideRecord with the instance of sys_trigger that triggered this discovery
 	*/
	startFromSchedule: function(schedule, job) {
		this.job = new DiscoveryJob(job);
		this.schedule = new DiscoverySchedule(this.job.scheduleID);
		this.status = new DiscoveryStatus(this.job, 'Scheduled', this.source);
		if (this.status.description == 'Scheduled') {
			if (this.atMaxConcurrentRunsForSchedule(schedule))
				return;
			else if (this.schedule.valid) {
				// resolve any open issues
				var errorManager = new SNC.DiscoveryErrorManager();
				errorManager.finishKeyInInstance(this.schedule.name, this.status.sysID);
			}

		}

		this._fireStartDiscoEvent();

		this.discoverFromSchedule();
	},

	/*
	* Starts a discovery for a single IP, using given schedule to get MID servers, behaviors etc.
	* schedule: a DiscoverySchedule instance to use
 	* ip:       the ip address to discover, as a dotted-format string
	* readCache: true => read DiscoveryRangesDB cache during Shazzam Launch
 	*
	* returns:  sys_id of status record created
	*/
	startFromIPInCache: function(schedule, ip) {
		schedule.readCache = true;

		return this.startFromIP(schedule, ip);
	},

	/*
 	* Starts a discovery for a single IP, using the given schedule to get MID servers, behaviors, etc.
 	* schedule: a DiscoverySchedule instance for the schedule to use
 	* ip:       the ip address to discover, as a dotted-format string
 	* returns:  sys_id of status record created
 	*/
	startFromIP: function(schedule, ip) {
		this.schedule = schedule;
		this.status = new DiscoveryStatus(schedule, 'Discover CI', this.source);

		this._fireStartDiscoEvent();

		this.discoverFromSchedule(ip);
		return this.status.sysID;
	},

	startAdmFromIP: function(schedule, ciId, osType, ip) {
		this.schedule = schedule;
		this.admCiId = ciId;
		this.admOsType = osType;
		this.status = new DiscoveryStatus(schedule, 'Refresh processes and connections', this.source);

		this._fireStartDiscoEvent();

		this.discoverFromSchedule(ip);
		return this.status.sysID;
	},

	startCloudDiscoveryFromDatacenter: function(datacenterSysId, serviceAccountSysId /* optional */) {
		this.status = DiscoveryPatternOrchestratorFlowLauncher.startQuickDatacenterDiscovery(datacenterSysId, serviceAccountSysId);
		this.schedule = this.status.getSchedule();
		this._fireStartDiscoEvent();

		return this.status.sysID;
	},

	startCloudDiscoveryFromDatacenterWithStatus: function(statusId, datacenterSysId, serviceAccountSysId /* optional */) {
		this.status = DiscoveryPatternOrchestratorFlowLauncher.startQuickDatacenterDiscoveryExistingStatus(statusId, datacenterSysId, serviceAccountSysId);
		this.schedule = this.status.getSchedule();
		this._fireStartDiscoEvent();

		return this.status.sysID;
	},

	/*
 	* Adds an IP (or comma-separated list of IPs) to an existing discovery (used by networks discovery).
 	*/
	addAdditionalIP: function(status, ip, sensor) {
		this.status = new DiscoveryStatus(status);
		this.schedule = new DiscoverySchedule(this.status.scheduleID);
		this.discoverFromSchedule(ip, true, sensor);
	},

	_fireStartDiscoEvent: function() {
		var sgr = this.status.getGlideRecord();
		if (sgr) {
			gs.eventQueue("discovery.started", sgr, this.status.name, this.schedule.name);
			gs.log('Fired started event for: ' + this.status.name + ' ' + this.schedule.name);
		}

		if (this.schedule.discover === 'CIs') {
			var dr = new DiscoveryResult(this.status.sysID);
			dr.createResult(this.schedule.sysID);
		}
	},

	/*
 	* Handles discovery of devices (whether Basic or Advanced) from a schedule.
 	*/
	discoverFromSchedule: function(ip, samePhase, sensor) {
		this.scheduleCancelJob();

		// Handle case of service discovery
		if (this.schedule.discoverService()) {
			var rdm = new SNC.RediscoveryManager();
			rdm.runScheduledDiscovery(this.job.scheduleID, this.status.sysID);
			return;
		}

		// Handle case of hostless discovery
		if (this.schedule.discoverHostless() ||
			this.schedule.discoverCaTrustCertificates() ||
			this.schedule.importCertificates()) {
				DiscoveryPatternOrchestratorFlowLauncher.startDiscovery(this.status.sysID, this.schedule.sysID, DiscoveryPatternOrchestratorFlowLauncher.discoveryType.serverless);
			return;
		}

		// Handle case of cloud discovery
		if (this.schedule.discoverCloud()) {
			var ptrnLchr = new SNC.PatternLauncherManager();
			ptrnLchr.launch(this.status.sysID, this.schedule.sysID,'cloud');
			return;
		}

		//Handle case of cloud resource discovery
		if(this.schedule.discoverCloudResources()){
			if (!new CloudResourceDiscoveryUtil().validateMIDCondition(this.schedule.sysID))
				this._cancelDiscoveryAndLogError();
			else {
				DiscoveryPatternOrchestratorFlowLauncher.startDiscovery(this.status.sysID, this.schedule.sysID, DiscoveryPatternOrchestratorFlowLauncher.discoveryType.cloudResources);
				new sn_cmp.CloudResourceDiscoveryLaunch(this.status, this.schedule).launch();
            }
			return;
		}

		// Handle launch of ADM probe for a refresh of host's processes and connections.
		if (this.schedule.refreshAdm()) {
			gs.log('status = ' + this.status.sysID);
			var utc = new UpdateTCPConnections();
			utc.run(this.admCiId, this.admOsType, ip, this.status);
			return;
		}

		if (this.schedule.discoverUrlCertificates()) {
			new URLCertificateDiscoveryLaunch(this.status, this.schedule).launch();
			return;
		}

		if (!this.schedule.discoverWebService()) {
			// cancel discovery if midServer is not valid
			if (this._specificMid() && !this.schedule.midServer.valid) {
				this._cancelDiscoveryAndLogError();
				return;
			}
			if (ip)
				this.status.setIPFromCI(ip);

			var dl;

			if (this.schedule.useSsmDiscovery) {
				dl = new SSMLaunch(this.status, this.schedule);
				dl.launch();
			} else {
				dl = new ShazzamLaunch(this.status, this.schedule);
				dl.launch(ip, samePhase, sensor);
			}
		} else {
				var dlArr = WebServiceDiscoveryLaunch.getDiscoveries(this.status, this.schedule);
				for (var i = 0; i < dlArr.length; i++)
					dlArr[i].launch();
		}
	},

	/*
 	* If the schedule specifies a cancel time, schedule a job to cancel if necessary...
 	*/
	scheduleCancelJob: function() {
		var chk = /^(?:(\d+) )?(\d{2}):(\d{2}):(\d{2})$/;
		// if a time is specified, launch a cancel-if-necessary job...
		var max_run = this.schedule.maxRun;
		if (!max_run)
			return;

		var dura = max_run.getDurationValue();
		var mat = chk.exec(dura);
		if (!mat)
			return;

		// calculate the cancellation time...
		var days = 0;
		if (mat[1])
			days += (mat[1] - 0);
		var secs = days * 3600 * 24;
		secs += ((mat[2] - 0) * 3600);
		secs += ((mat[3] - 0) * 60);
		secs += ((mat[4] - 0) * 1);
		if (secs <= 0)
			return;

		var ct = new GlideDateTime();
		ct.addSeconds(secs);

		gs.log('Scheduling Discovery ' + this.status.number + ' for cancellation at ' + ct.toString());

		// insert our scheduled job into sys_trigger
		var gr = new GlideRecord('sys_trigger');
		gr.initialize();
		gr.name = 'Cancel Discovery';
		gr.next_action = ct; // cancellation GlideDateTime we computed above
		gr.trigger_type = 0; // 0 = "once only"
		gr.state = 0; // 0 = "ready"
		gr.script = this.getCancelScript();

		gr.insert();
	},

	getCancelScript: function() {
		var script =
			"cancelThisDiscovery();\n" +
			"function cancelThisDiscovery() {\n" +
			"var gr = new GlideRecord('discovery_status');\n" +
			"if (!gr.get('sys_id', '" + this.status.sysID + "'))\n" +
			"return;\n" +
			"var state = '' + gr.state;\n" +
			"if (!((state == 'Active') || (state == 'Starting')))\n" +
			"return;\n" +
			"gs.log('Cancelling Discovery " + this.status.number + "');\n" +
			"var dl = new SncDiscoveryLog('" + this.status.sysID + "');\n" +
			"dl.info('Canceling discovery because max run time window has been exceeded');\n" +
			"var dc = new SncDiscoveryCancel();\n" +
			"dc.cancelAll('" + this.status.sysID + "');\n" +
			"}";
		return script;
	},

	atMaxConcurrentRunsForSchedule: function(schedule) {
		var maxDefault = 3;
		var maxActive = parseInt(gs.getProperty('glide.discovery.max_concurrent_invocations_per_schedule', maxDefault), 10);
		if (isNaN(maxActive))
			maxActive = maxDefault;

		if (maxActive < 1)
			return false;

		var gr = new GlideRecord('discovery_status');
		gr.addQuery('dscheduler', schedule.getValue('sys_id'));
		var qc = gr.addQuery('description', 'Scheduled');
		qc.addOrCondition('description', 'Discover Now');
		gr.addQuery('state', 'Active');
		gr.query();
		var activeCount = gr.getRowCount();

		if (activeCount < maxActive)
			return false;

		// At this point, we know the activeCount is >= maxActive, so we are over the limit.
		// Per PRB1342888 we will initiate an additional gating condition before we prevent
		// creation of a new discovery for this schedule, namely whether the discoveries have ECC Queue records
		//
		// First, fetch the oldest discovery status for this schedule that has these active discoveries
		// Ideally, we should check all of them, but this is a compromise optimization to improve performance
		// The reasoning is that if the newer Discovery Status have ECC Queue records cleaned up, then certainly
		// the older ones will as well.  We only need one Discovery Status to clean up, so let's check the
		// most likely candidate.
		var oldestDiscoGr = new GlideRecord('discovery_status');
		oldestDiscoGr.addQuery('dscheduler', schedule.getValue('sys_id'));
		oldestDiscoGr.addQuery('description', 'Scheduled');
		oldestDiscoGr.addQuery('state', 'Active');
		oldestDiscoGr.orderBy('sys_created_on');
		oldestDiscoGr.setLimit(1);
		oldestDiscoGr.query();

		var preventFurtherDiscoveries = true;
		if (oldestDiscoGr.hasNext()) {
			oldestDiscoGr.next();
			var agent_correlator = oldestDiscoGr.getValue('sys_id');
			// Check whether this discovery status has no ECC Queue records
			var eccQueueGr = new GlideRecord('ecc_queue');
			eccQueueGr.addQuery('agent_correlator', agent_correlator);
			eccQueueGr.setLimit(1);
			eccQueueGr.query();
			if (eccQueueGr.hasNext()) {
				// At least one ECC Queue record exists for this oldest discovery, so the prevention prevails
				preventFurtherDiscoveries = true;
			} else {
				// No ECC Queue record exists, so Cancel this oldest discovery and lift the prevention
				var canceller =  new SncDiscoveryCancel();
				canceller.cancelAll(agent_correlator);
				preventFurtherDiscoveries = false;
				return false;
			}
		}

		if (preventFurtherDiscoveries) {
			var link = new RecordToHTML(schedule.getTableName(), schedule.getValue('sys_id'), '${name}',  true);
			var msg = '[code]'
				+ 'Canceled discovery of '
				+ link.toString()
				+ '. Already at maximum number of active \'Scheduled\' invocations ('
				+ maxDefault
				+ ') for a given schedule'
				+ '[/code]';
			var dl = new DiscoveryLogger(this.status.sysID);
			dl.error(msg, 'Discovery');
			gr = this.status.getGlideRecord();
			gr.setValue('state', 'Canceled');
			gr.update();

			//TODO: Increase the scope when we need to log other errors in this Script Include
			var scheduleName = schedule.getValue('name');
			var errorParams = {
				code: 'SN-5402',
				instance: this.status.sysID,
				key: scheduleName,
				source: schedule.getValue('sys_id'),
				contextMap: {
					ip_address: null,
					device_class: null
				},
				message: 'Canceled discovery of ' + scheduleName + '. Already at maximum number of active \'Scheduled\' invocations (' + maxActive + ')'
			};

			DiscoveryErrorsUtilities.addError(errorParams);
			return true;
		}
	},

	_logInfo: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.INFO);   // enforce the level
		this.dLogger.info(msg, 'StartDiscovery');
	},

	_logError: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.ERROR);
		this.dLogger.error(msg, 'StartDiscovery');
	},

	_logWarning: function(msg) {
		this.dLogger.setLevel(DiscoveryLogger.WARNING);
		this.dLogger.warn(msg, 'StartDiscovery');
	},

	_logErrorAndCancelStatus: function(msg) {
		this.dLogger = new DiscoveryLogger(this.status);
		this._logError(msg);
		var dac =  new SncDiscoveryCancel();
		dac.cancelAll(this.status.sysID);
	},

	type: "StartDiscovery"
};
