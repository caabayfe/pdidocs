var UpdateNLUDiscoveryOutcomes = Class.create();

/*
 * This will process all the records from the given date range until now in the Open NLU Predict Intent Feedback Table and update the NLU Discovery Outcome for each record.
 * Note that this will override any existing values it finds.
 */
UpdateNLUDiscoveryOutcomes.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
    },

	OPEN_NLU_PREDICT_INTENT_FEEDBACK: "open_nlu_predict_intent_feedback",
	NLU_DISCOVERY_OUTCOME: "nlu_discovery_outcome",
	SYS_EVENT: "sys_event",

	/*
	 * Update the NLU Discovery Outcome for each record in the Open NLU Predict Intent Feedback table.
	 */
	updateNluDiscoveryOutcomes: function() {
		var totalRecordsProcessed = 0;

		var sysEvents = this.getUniqueSysEvents();
		this.logger.info("Total number of SysEvents to process: " + sysEvents.length);

		// Process all unmapped records
		totalRecordsProcessed += this.processUnmappedRecords();

		// Process all mapped records
		for (var i = 0; i < sysEvents.length; i++)
			totalRecordsProcessed += this.processSysEvent(sysEvents[i]);

		this.logger.info("Total records processed: " + totalRecordsProcessed);
	},

	/*
	 * Process the records corresponding to each SysEvent.
	 */
	processSysEvent: function(sysEvent) {
		this.logger.info("Processing SysEventId: " + sysEvent);

		var gr = new GlideRecord(this.OPEN_NLU_PREDICT_INTENT_FEEDBACK);
		gr.addQuery(this.SYS_EVENT, sysEvent);
		gr.addQuery("mapped", "true");
		gr.query();

		if (gr.getRowCount() == 0)
			return 0;

		if (gr.getRowCount() == 1) {
			if (gr.next())
				this.processEventWithSingleRecord(gr);
			return 1;
		}

		this.processEventWithMultipleRecords(gr, sysEvent);
		return gr.getRowCount();
	},

	/*
	 * Process all unmapped records.
	 * Records where confidence is null will be marked as skipped and all others will remain uncategorized.
	 */
	processUnmappedRecords: function(gr) {
		this.logger.info("Processing all unmapped records.");

		var grUnmapped = new GlideRecord(this.OPEN_NLU_PREDICT_INTENT_FEEDBACK);
		grUnmapped.addQuery("mapped", "false");
		grUnmapped.addQuery("confidenceISEMPTY");

		grUnmapped.setValue(this.NLU_DISCOVERY_OUTCOME, "skipped");
		grUnmapped.updateMultiple();

		grUnmapped.query();
		return grUnmapped.getRowCount();
	},

	/*
	 * Process an SysEvent corresponding to a single record.
	 */
	processEventWithSingleRecord: function(gr) {
		if (gs.nil(gr.getValue("confidence")))
			gr.setValue(this.NLU_DISCOVERY_OUTCOME, "skipped");
		else if (gr.getValue("auto_selected").toString() == "1") {
			var userConfirmation = gr.getValue("user_confirmation").toString();

			if (userConfirmation == "Yes")
				gr.setValue(this.NLU_DISCOVERY_OUTCOME, "correct");
			else if (userConfirmation == "No")
				gr.setValue(this.NLU_DISCOVERY_OUTCOME, "incorrect");
			else // "NA" case i.e. the user abandoned the conversation once the topic was shown
				return;
		} else {
			this.logger.warn("Coud not update the NLU Discovery Outcome for record sysId: " + gr.getValue("sys_id").toString() + " as it was not autoSelected = true or confidence = null");
			return;
		}

		gr.update();
	},

	/*
	 * Process an SysEvent corresponding to a single record.
	 */
	processEventWithMultipleRecords: function(gr, sysEvent) {
		var appDocumentTable = "";
		var appDocumentSysId = "";
		var conversationTaskState = "";

		// If a record is Selected, set it to correct among multiple
		while (gr.next()) {
			appDocumentTable = gr.getValue("app_document_table").toString();
			appDocumentSysId = gr.getValue("app_document").toString();

			if (gr.getValue("selected").toString() == "1") {
				gr.setValue(this.NLU_DISCOVERY_OUTCOME, "correct_among_multiple");
				gr.update();
				return;
			}
		}

		if (appDocumentTable != "sys_cs_conversation_task") {
			this.logger.warn("The NLU Discovery Outcome for the records with the sysEventId: " + sysEvent + " were not processed as the App Document Table was not sys_cs_conversation_task.");
			return;
		}

		// If no record is Selected, check in the SysConversationTask whether no topic was selected or the topic was abandoned
		var gr2 = new GlideRecord(appDocumentTable);
		gr2.addQuery("calling_task", appDocumentSysId);
		gr2.query();
		if (gr2.next())
			conversationTaskState = gr2.getValue("state").toString();
		else {
			this.logger.warn("The NLU Discovery Outcome for the records with the sysEventId: " + sysEvent + " were not processed as the App Document : " + appDocumentSysId + " was not found in the sys_cs_conversation_task Calling Tasks.");
			return;
		}

		if (conversationTaskState == "suspended" || conversationTaskState == "completed") {
			var gr3 = new GlideRecord(this.OPEN_NLU_PREDICT_INTENT_FEEDBACK);
			gr3.addQuery(this.SYS_EVENT, sysEvent);
			gr3.addQuery("mapped", "true");
			gr3.orderByDesc("confidence");
			gr3.query();

			if (gr3.next()) {
				gr3.setValue(this.NLU_DISCOVERY_OUTCOME, "incorrect_among_multiple");
				gr3.update();
			}
		} else {
			this.logger.info("The NLU Discovery Outcome for the records with the sysEventId: " + sysEvent + " were set to Uncategorized as the conversation was abandonded by the user");
		}
	},

	/*
	 * Get a list of the latest 10k unique SysEvents in the Open Nlu Predict Intent Feedback table
	 */
	getUniqueSysEvents: function() {
		var sysEvents = [];

		var ga = new GlideAggregate(this.OPEN_NLU_PREDICT_INTENT_FEEDBACK);
		ga.groupBy(this.SYS_EVENT);
		ga.addQuery("sys_eventISNOTEMPTY");
		ga.orderByDesc("sys_created_on");
		ga.setLimit(10000);
		ga.query();
		while (ga.next()) {
			var sysEventId = ga.getValue(this.SYS_EVENT).toString();
			sysEvents.push(sysEventId);
		}

		return sysEvents;
	},
	
	type: 'UpdateNLUDiscoveryOutcomes'
};
