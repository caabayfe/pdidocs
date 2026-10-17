var CAPARDataMigration = Class.create();
CAPARDataMigration.prototype = {
    initialize: function() {
        this.CAProcessor = new CAProcessor();
        this.CAPARProcessor = new CAPARProcessor();
        this.CAConfig = new CAConfig();
    },

    _toggleETLActiveStatus: function(enable) {
        var isActive = this.CAConfig.isAnalyticsProcessingEnabled() == "true";
        if (isActive && !enable) {
            this.CAConfig.disableAnalyticsProcessing();
        } else if (!isActive && enable) {
            this.CAConfig.enableAnalyticsProcessing();
        }
        return isActive;
    },

    _getDateEncodedQuery: function(startDate, endDate, field) {
        if (gs.nil(field))
            field = "sys_created_on";
        return field + "BETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')"
    },

    _getConversationCount: function(startDate, endDate) {
        var gr = new GlideAggregate('sys_cs_conversation');
        gr.addEncodedQuery(this._getDateEncodedQuery(startDate, endDate));
        gr.addQuery("conversation_type", "!=", 'notification');
        gr.addAggregate('COUNT');
        gr.query();
        if (gr.next()) {
            return gr.getAggregate('COUNT');
        }
        return 0;
    },

    _getConversations: function(startDate, endDate) {
        var gr = new GlideRecord('sys_cs_conversation');
        gr.addEncodedQuery(this._getDateEncodedQuery(startDate, endDate));
        gr.addQuery("conversation_type", "!=", 'notification');
        gr.query();
        return gr;
    },

    _getCAConversations: function(startDate, endDate) {
        var gr = new GlideRecord('sn_ci_analytics_conversation');
        gr.addEncodedQuery(this._getDateEncodedQuery(startDate, endDate, 'conversation_created_at'));
        gr.addQuery('status', CAConstants.status.NEW);
        gr.query();
        return gr;
    },

    _updateConversationStatus: function(gr) {

        var status = gr.getValue('status');
        var par_status = gr.getValue('par_status');
        var appsee_status = gr.getValue('appsee_status');
        var conversationPayload = gr.getValue('conversation_payload');

        if (par_status == CAConstants.status.PROCESSED)
            return;

        var isFirstTimeUpgrade = gs.nil(par_status) && gs.nil(appsee_status);
        if (gs.nil(par_status)) {
            gr.setValue('par_status', CAConstants.status.NEW);
        }
        if (gs.nil(appsee_status)) {
            gr.setValue('appsee_status', CAConstants.status.NEW);
        }
        if (isFirstTimeUpgrade) {
            // USECASE1: FIRST TIME UPGRADATION
            // case 1: status == new and par_status and appsee_status are empty.
            if (status == CAConstants.status.NEW) {
                // this conversation should processed for both Appsee and PAR
                gr.setValue('par_status', CAConstants.status.NEW);
                gr.setValue('appsee_status', CAConstants.status.NEW);
            }
            // case 2: status == processed and conversation_payload is not available.
            if (status == CAConstants.status.PROCESSED && gs.nil(conversationPayload)) {
                gr.setValue('status', CAConstants.status.NEW);
                gr.setValue('par_status', CAConstants.status.NEW);
                //// Appsee already had this conversation so marking as processed
                gr.setValue('appsee_status', CAConstants.status.PROCESSED);
            }
        } else if (status == CAConstants.status.PROCESSED && gs.nil(conversationPayload)) {
            //case 2: sn_ci_analytics_conversation do have some status in par_status and appsee_status.
            // Manually migrating data for last x number of days.
            gr.setValue('status', CAConstants.status.NEW);
            gr.setValue('par_status', CAConstants.status.NEW);
        } else if (status == CAConstants.status.PROCESSED && !gs.nil(conversationPayload)) {
            //case 2: sn_ci_analytics_conversation do have some status in par_status and appsee_status.
            // Manually migrating data for last x number of days.
            gr.setValue('par_status', CAConstants.status.NEW);
        }
        gr.update();
    },

    _insertNewConversation: function(conversationGr) {
        var gr = new GlideRecord('sn_ci_analytics_conversation');
        gr.initialize();
        gr.conversation = conversationGr.getValue("sys_id");
        gr.status = CAConstants.status.NEW;
        gr.par_status = CAConstants.status.NEW;
        gr.appsee_status = CAConstants.status.PROCESSED;
        gr.conversation_created_at = conversationGr.getValue('sys_created_on');
        gr.conversation_closed_at = conversationGr.getValue('conversation_completed');
        gr.conversation_type = conversationGr.getValue('conversation_type');
        gr.consumer = conversationGr.consumer.sys_id;
        return gr.insert();
    },

    _migrateConversations: function(conversationGr) {
        while (conversationGr.next()) {
            var conversationId = conversationGr.getValue("sys_id");
            var gr = new GlideRecord('sn_ci_analytics_conversation');
            gr.addQuery('conversation', conversationId);
            gr.query();
            if (gr.next()) {
                this._updateConversationStatus(gr);
            } else {
                this._insertNewConversation(conversationGr);
            }
        }
    },

    _batchProcessConversations: function(caConversationGr) {
        while (caConversationGr.next()) {
            this.CAProcessor.processConversation(caConversationGr);
            this.CAPARProcessor.processConversation(caConversationGr);
        }
    },

    _triggerDataCollectionJob: function(jobId) {
        var gr = new GlideRecord('sysauto_pa');
        gr.get(jobId);
        gs.executeNow(gr);
    },

    // return abs value
    _noOfDaysBetweenDates: function(date1, date2) {
        date1 = new GlideDateTime(date1);
        date2 = new GlideDateTime(date2);
        var noOfDays = (date1.getNumericValue() - date2.getNumericValue()) / (1000 * 60 * 60 * 24);
        return Math.abs(noOfDays);
    },

    _isValidDates: function(startDate, endDate) {
        if (gs.nil(startDate))
            throw new Error("Please provide valid start date");
        if (gs.nil(endDate))
            throw new Error("Please provide valid end date");
        var sd = new GlideDateTime(startDate);
        var ed = new GlideDateTime(endDate);
        if (!sd.isValid())
            throw new Error('Start date is not valid');
        if (!ed.isValid())
            throw new Error('End date is not valid');
        if (sd.compareTo(ed) == 1) throw new Error("The start date should be earlier than the end date.");
        var noOfDays = this._noOfDaysBetweenDates(startDate, endDate); //(ed.getNumericValue() - sd.getNumericValue()) / (1000 * 60 * 60 * 24);
        if (noOfDays > 180) throw new Error("Maximum Limit for data migration is 180 days");
        return true;
    },

    _isRecordCountInTimeRangeValid: function(startDate, endDate) {
        var noOfRecordsInTimeRange = this._getConversationCount(startDate, endDate);
        var maxNumberRecords = parseInt(gs.getProperty('sn_ci_analytics.ca.migration_max_records', 300000));
        if (noOfRecordsInTimeRange == 0) {
            gs.info("No records available within the selected time range.");
            return false;
        } else if (noOfRecordsInTimeRange > maxNumberRecords) {
            gs.info("The selected date range has " + noOfRecords + " records, exceeding the threshold limit of " + maxNumberRecords + ". Please adjust the time range to stay within the threshold limit.");
            return false;
        }
        return true;
    },

    _setDataCollectionJobsRelativeDays: function(startDate, endDate) {
        var dataCollectionJobs = [CAPARConstants.DATA_COLLECTION_JOBS.HISTORICAL_GENERAL, CAPARConstants.DATA_COLLECTION_JOBS.HISTORICAL_SEARCH_AND_CUSTOM_EVENTS];
        var today = new GlideDateTime();
        var gr = new GlideRecord('sysauto_pa');
        gr.addQuery('sys_id', 'IN', dataCollectionJobs);
        gr.query();
        while (gr.next()) {
            gr.score_relative_start = this._noOfDaysBetweenDates(today, startDate);
            gr.score_relative_end = this._noOfDaysBetweenDates(today, endDate);
            gr.score_relative_start_interval = 'days';
            gr.score_relative_end_interval = 'days';
            gr.update();
        };
    },

    _triggerDataCollectionJobs: function(startDate, endDate) {
        this._setDataCollectionJobsRelativeDays(startDate, endDate);
        this._triggerDataCollectionJob(CAPARConstants.DATA_COLLECTION_JOBS.HISTORICAL_GENERAL);
        this._triggerDataCollectionJob(CAPARConstants.DATA_COLLECTION_JOBS.HISTORICAL_SEARCH_AND_CUSTOM_EVENTS);
    },
    /*
    	Inputs: 
    	1. startDate: "YYYY-MM-DD" (ex: "2024-01-01")
    	2. endDate: "YYYY-MM-DD" (ex: "2024-03-10")
    */
    migrate: function(startDate, endDate) {
        if (!this._isValidDates(startDate, endDate))
            return;
        startDate = new GlideDateTime(startDate);
        endDate = new GlideDateTime(endDate);
        var today = new GlideDateTime();

        // Restricting the startDate and endDate should not exceed today
        if (startDate.after(today))
            startDate = today;
        if (endDate.after(today))
            endDate = today;
        startDate = startDate.getDate();
        endDate = endDate.getDate();

        if (!this._isRecordCountInTimeRangeValid(startDate, endDate))
            return;

        // if ETL disabled by this script then only enable at end of migration
        var isETLDisabled = this._toggleETLActiveStatus(false);

        try {
            gs.info("PARMigrationScript:: Started Migration Script...");
            var conversationGr = this._getConversations(startDate, endDate);
            this._migrateConversations(conversationGr);
            gs.info("PARMigrationScript:: sys_cs_conversation records moved to sn_ci_analytics_conversation table");
            var caConversationGr = this._getCAConversations(startDate, endDate);
            gs.info("PARMigrationScript:: Starting processing records from sn_ci_analytics_conversation table...");
            this._batchProcessConversations(caConversationGr);
            gs.info("PARMigrationScript:: Initiating PAR Data Collection jobs");
            this._triggerDataCollectionJobs(startDate, endDate);
        } catch (err) {
            var message = "CI analytics PAR data migration failed:" + err.message;
            if (err.stack)
                message = message + "\n" + err.stack;
            gs.error(message);
        }

        if (isETLDisabled) { // enable ETL if ETL is disabled by this script.
            this._toggleETLActiveStatus(true);
        }
    },

    type: 'CAPARDataMigration'
};
