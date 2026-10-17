var ContentUpdateAPI = Class.create();

ContentUpdateAPI.STEP = 'Processing ';
ContentUpdateAPI.STATUS_SUCCESS = 'SUCCESS';
ContentUpdateAPI.STATUS_FAILURE = 'FAILURE';
ContentUpdateAPI.CDS_SCHEDULE_TABLE = 'cds_client_schedule';

ContentUpdateAPI.prototype = {

    initialize: function(params) {
		this.jobParams = {
			jobName: '',
			propertyTableName: '',
			keyLastRunDate: '',
			jobLogMessage: '',
			contentTables: [],
			contentTablesHandlers: {},
			onPremTracker: '',
			runPostProcessing: [], // Implement postProcessing() method in your handler
		};
		if (GlidePluginManager.isActive('com.sn_sam_saas_int')) {
			this.jobParams.keyLastSkuRunDate = '';
		}

		this.setProperties(params);

		// Fetching the last run date to initialize the date effective clause
		this.initializeLastRunDate();

		// Initializing job log util
		this.jobLogUtil = new AssetJobLogUtil();
    },

	setProperties: function(params) {
		this.jobParams = {
			jobName: params.jobName,
			propertyTableName: params.propertyTableName,
			keyLastRunDate: params.keyLastRunDate,
			jobLogMessage: params.jobLogMessage,
			contentTables: params.contentTables,
			contentTablesHandlers: params.contentTablesHandlers,
			onPremTracker: params.onPremTracker,
			runPostProcessing: params.runPostProcessing,
		};

		if (GlidePluginManager.isActive('com.sn_sam_saas_int') && this.jobParams.propertyTableName === 'sam_property') {
			this.jobParams.keyLastSkuRunDate = params.keyLastSkuRunDate;
		}
	},

	initializeLastRunDate: function() {
		this.now = new GlideDateTime();
		var prevRunDate;
		var currValue;
		// Query the properties table to get the last successful run date for the date effective clause
		new GlideQuery(this.jobParams.propertyTableName)
			.getBy({key: this.jobParams.keyLastRunDate}, ['value'])
			.ifPresent(function(u) {
				currValue = u['value'];
			});

		if (!gs.nil(currValue)) {
			prevRunDate = new GlideDateTime(currValue);
			this.dateEffectiveClause = 'sys_updated_onBETWEEN' + prevRunDate + '@' + this.now;
		}
	},

	runJob: function() {
		this.jobLogUtil.startJobLog(this.jobParams.jobLogMessage);

		if (this.jobParams.jobName === 'HAM - Apply latest content changes' && sn_hamp.HAMUtils.isZTMOnlyInstance()) {
			this.jobLogUtil.stopJobLog(this.jobLogUtil.COMPLETED_STATUS, sn_hamp.HAMConstants.ZTM_LOG_MESSAGE);
			return;
		}
		
		try {
			// Process Content updates per table
			this.jobParams.contentTables.forEach(function(table) {
				this.processTable(table);
			}.bind(this));

			// Stop job log
			this.jobLogUtil.stopJobLog(this.jobLogUtil.COMPLETED_STATUS, 'Updates Processed');
			this.updateLastRunDateProperty();

		} catch (error) {
			// Capture error in job log
			this.jobLogUtil.stopJobLog(this.jobLogUtil.FAILED_STATUS, error.message);
		}
	},

	processTable: function(table) {
		// Job step logging
		this.jobLogUtil.startJobStep(ContentUpdateAPI.STEP + table);

		var dupGr;

		var contentRecord = new GlideRecord(table);
		if (contentRecord.isValid()) {

			// Add query on content_version so that records from child(custom) tables will not be included
			if(contentRecord.isValidField('content_version')) {
				contentRecord.addNotNullQuery('content_version');
			}
			// Update else condition to handle sam tables

			//Get the records which were modififed after the last run date
			if (!gs.nil(this.dateEffectiveClause)) {
				contentRecord.addEncodedQuery(this.dateEffectiveClause);
			}

			contentRecord.query();
			if (contentRecord.hasNext()) {
				// Instantiate handler class
				// hwnorm2hamp var handler = new global[this.jobParams.contentTablesHandlers[table]];
				var handler;
				if (this.jobParams.contentTablesHandlers[table].startsWith('HAM')) {
					handler = new sn_hamp[this.jobParams.contentTablesHandlers[table]];
				}
				else if (this.jobParams.contentTablesHandlers[table].startsWith('EAM')) {
					handler = new sn_eam[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('SamSaas')) {
					handler = new sn_sam_saas_int[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('IBM')) {
					handler = new sn_samp_ibm_lic[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('SampValueBuilderContentHandler')) {
					handler = new sn_sam_workspace[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('SampMaturityItemContentHandler')) {
					handler = new sn_sam_workspace[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('Firmware')) {
					handler = new sn_itam_common[this.jobParams.contentTablesHandlers[table]];
				} else if (this.jobParams.contentTablesHandlers[table].startsWith('SampRegex')) {
					handler = new sn_itam_samp[this.jobParams.contentTablesHandlers[table]];
				} else {
					handler = new global[this.jobParams.contentTablesHandlers[table]];
				}
			}

			while (contentRecord.next()) {
				try {
					dupGr = new GlideRecord(table);
					dupGr.get(contentRecord.getUniqueValue());
					handler.process(dupGr);
				} catch (error) {
					this.jobLogUtil.stopJobStep(ContentUpdateAPI.STEP + table, 'Error while processing record ' + contentRecord.getUniqueValue() + ' : ' + error.message);
					throw error;
				}
			}
			if (this.jobParams.runPostProcessing.indexOf(table) > -1 &&
				typeof handler.postProcessing === 'function') {
				handler.postProcessing();
			}
			this.jobLogUtil.stopJobStep(ContentUpdateAPI.STEP + table, 'Completed');
		}
	},

	updateLastRunDateProperty: function() {
		new GlideQuery(this.jobParams.propertyTableName)
			.where('key', this.jobParams.keyLastRunDate)
			.updateMultiple({
				value: this.now.getValue()
			});

		if (GlidePluginManager.isActive('com.sn_sam_saas_int') && this.jobParams.propertyTableName === 'sam_property') {
			new GlideQuery(this.jobParams.propertyTableName)
			.where('key', this.jobParams.keyLastSkuRunDate)
			.updateMultiple({
				value: this.now.getValue()
			});
		}
	},

    type: 'ContentUpdateAPI'
};
