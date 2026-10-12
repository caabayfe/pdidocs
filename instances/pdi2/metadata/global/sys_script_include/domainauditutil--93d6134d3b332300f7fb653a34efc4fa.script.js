var DomainAuditUtil = Class.create();
 
DomainAuditUtil.prototype = {
	
	STATUS_QUEUED: "queued",
	STATUS_RUNNING: "running",
	STATUS_NEVER_RUN: "never_run",
	STATUS_PASSED: "passed",
	STATUS_FAILED: "failed",
	
	LOG_SOURCE: 'Domain Separation Center',
	
	API_MAP: {
		// Domain Table Validation
		'domainPathsEnabled': 'chkDomainTablePathsEnabled',
		'domainTableOrphans': 'chkDomainTableOrphans',
		'domainTablePathIndex': 'chkDomainTableUniqueIndexPath',
		'domainTablePaths': 'chkDomainTablePath',
		'domainTableSchema': 'chkDomainTableDBSchema',

		// Domain Table Best Practice
		'defaultDomainDefined': 'chkDomainTableBestPracticeDefault',
		'longDomainNames': 'chkDomainTableBestPracticeLongNames',
		'domainHierarchyDepth': 'chkDomainTableBestPracticeDepth',
		'domainMemoryUsage': 'chkDomainTableBestPracticeMemory',
		
		// Domain Contains
		'domainContainsCount': 'chkDomainContainsCount',
		'domainContainsDuplicates': 'chkDomainContainsDuplicates',
		'domainContainsInvalidReferences': 'chkDomainContainsInvalidRefs',
		'DomainContainsRedundancy': 'chkDomainContainsRedundant',
		
		// Domain Group Visibility
		'groupVisibilityDuplicates': 'chkDomainGroupVisibilityDuplicates',
		'groupVisibilityInvalidRecords': 'chkDomainGroupVisibilityInvalidRecords',
		'groupVisibilityRedundancy': 'chkDomainGroupVisibilityRedundant',
		
		// Domain User Visibility
		'userVisibilityDuplicates': 'chkDomainUserVisibilityDuplicates',
		'userVisibilityInvalidRecords': 'chkDomainUserVisibilityInvalidRecords',
		'userVisibilityRedundancy': 'chkDomainUserVisibilityRedundant',
		'userVisibilityThresholdExceeded': 'chkDomainUserVisibilityExceededThreshold', //user's excessive domain visibility
		
		// Data Validation
		'dataValidationInvalidDomain': 'chkDataInvalidDomainExcludingBigTables',
		'dataValidationInvalidDomainBigTables': 'chkDataInvalidDomainForBigTables',
		'dataValidationInvalidPath': 'chkDataInvalidPathExcludingBigTables',
		'dataValidationInvalidPathBigTables': 'chkDataInvalidPathForBigTables',
		'dataInGlobalDomain': 'chkDataInGlobalDomain',
		'nonAdminUsersInGlobalDomain': 'chkDataInGlobalDomainNonAdminUser',
		
		// Process Validation
		'invalidOverrides': 'chkDomainProcessInvalidOverrides',
		'redundantOverrides': 'chkDomainProcessRedundantOverrides',
		
		// Domain Usage
		'domainUsageDistribution': 'chkDomainUsageDistribution',
		'unusedDomains': 'chkDomainUsageUnused',
		'domainUnreachableByUsers': 'chkDomainUsageUnreachableByUsers',
		
		// Performance
		'inefficientQueries': 'chkPerformanceInefficientQueries',
		'missingIndexes': 'chkPerformanceMissingIndexes',
		
		// Database Schema
		'checkMissingPath': 'chkDBSchemaMissingPath',
		'conflictWithParent': 'chkDBSchemaConflictWithParent',
		'domainTableColumnOrAttribute': 'chkDomainTableColumnOrAttribute'
	},
	
	initialize: function(){},
 
	// entry point for running an audit
	// all "run-now" audits are scheduled to run via sys_trigger
	runAudit: function(auditSysId){
		var audit = this._getAudit(auditSysId);
		if (audit && audit.active)
			return this._scheduleRunNowAudit(audit.api_entry_point);
		else
			return false;
	},
	
	// entry point for scheduled jobs to run associated audits
	runScheduledJob: function(scheduleName) {
		this._log('Running scheduled job: ' + scheduleName, this.LOG_SOURCE);
		var gr = new GlideRecord('domain_audit_definition');
		gr.addQuery('frequency', scheduleName);
		gr.addQuery('active', true);
		gr.query();
		while (gr.next()) {
			this._log('Nightly scheduled audit: ' + gr.name + ' -> ' + gr.api_entry_point, this.LOG_SOURCE);
			this._runAudit(gr.api_entry_point);
		}
	},
	
	deactivateAudit: function(auditSysId) {
		var audit = this._getAudit(auditSysId);
		if(audit) {
			audit.active = false;
			audit.update();
			this._log('Deactivated audit: ' + audit.name + '(' + audit.sys_id + ')', this.LOG_SOURCE);
		} else
			return false;
			
	},
		
	_scheduleRunNowAudit: function(apiEntryPoint) {
		if (this._updateActiveState(apiEntryPoint, this.STATUS_QUEUED)) {
			var schedule = new ScheduleOnce();
			schedule.setLabel("Run Domain Audit - " + apiEntryPoint);
			schedule.script = "new DomainAuditUtil()._runAudit('" + apiEntryPoint + "');";
			return schedule.schedule();
		} else {
			this._log('Not starting RunNow audit for ' + apiEntryPoint + '. Audit is already queued/running.', this.LOG_SOURCE);
			return false;
		}
	},
	
	_runAudit: function(apiEntryPoint) {
		var dhc = new SNC.DSCScriptableAPI();
		var result;
		var duration;

		if (this.API_MAP[apiEntryPoint]) {
			if (this._updateActiveState(apiEntryPoint, this.STATUS_RUNNING)) {
				try {
					var before = new Date().getTime();
					result = dhc[this.API_MAP[apiEntryPoint]]();
					var after = new Date().getTime();
					duration = after - before;
				} catch(e) {
					result = this._getErrorGuid();
					this._log('Error executing audit: ' + apiEntryPoint, result);
				}
				this._saveResult(apiEntryPoint, result, duration);
			} else {
				// skip audit, as it's already running
				this._log('DomainAuditUtil: Not running ' + apiEntryPoint + '. Audit is already queued/running.', this.LOG_SOURCE);
				return;
			}
		} else
			return this._notImplemented(apiEntryPoint);
	},
	
	_notImplemented: function(apiEntryPoint) {
		this._log('Invalid audit entry point: ' + apiEntryPoint, this.LOG_SOURCE);
		return false;
	},
	
	_getErrorGuid: function() {
		return GlideGuid.generateRand();
	},
	
	_log: function(message, source) {
		GlideSysLog.info('syslog_domain', source, message);
	},

	_updateActiveState: function(apiEntryPoint, newState) {
		var sysId = this._getResultSysID(apiEntryPoint);
		
		var invalidTransitions = [];
		if (newState == this.STATUS_RUNNING)
			invalidTransitions = [this.STATUS_RUNNING];
		else if (newState == this.STATUS_QUEUED)
			invalidTransitions = [this.STATUS_RUNNING, this.STATUS_QUEUED];
		
		// uses updateMultiple to only update when state isn't in 'active' states
		// updateMultiple will update with a where clause in a single SQL statement
		// vs query + update which will allow a race condition if 2 different threads query at same time
		var gr = new GlideRecord('domain_audit_result');
		gr.addQuery('sys_id', sysId);
		gr.addQuery('status', 'NOT IN', invalidTransitions);
		gr.status = newState;
		gr.detail_id = '';
		gr.duration = '';
		gr.updateMultiple();
		
		return (gr.getRowCount() == 1);
	},
	
	_saveResult: function(apiEntryPoint, apiResult, duration) {
		var sysId = this._getResultSysID(apiEntryPoint);
		var gr = new GlideRecord('domain_audit_result');
		gr.get(sysId);
		
		if (gr.isValidRecord()) {
			if ('OK' === apiResult) {
				gr.status = this.STATUS_PASSED;
				gr.detail_id = '';
			} else {
				gr.status = this.STATUS_FAILED;
				gr.detail_id = apiResult;
			}
			
			if (!duration) 
				duration = 0;
				
			gr.duration = duration;
			gr.last_run = new GlideDateTime();
			gr.update();
		}
	},
	
	_getAudit: function(auditSysId) {
		var gr = new GlideRecord('domain_audit_definition');
		gr.get(auditSysId);
		if (gr.isValidRecord())
			return gr;

		return null;
	},
	
	_getResultSysID: function(apiEntryPoint) {
		var gr = new GlideRecord('domain_audit_result');
		gr.addQuery('audit.api_entry_point', apiEntryPoint);
		gr.query();
		if (gr.next())
			return gr.sys_id;
		else
			return -1;
	},
 
	type :'DomainAuditUtil'};
