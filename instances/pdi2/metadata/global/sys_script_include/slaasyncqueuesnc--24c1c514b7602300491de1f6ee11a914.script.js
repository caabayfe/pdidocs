var SLAAsyncQueueSNC = Class.create();
SLAAsyncQueueSNC.prototype = {
	SLA_ASYNC_QUEUE_LOG: 'com.snc.sla.async.queue.log',

	initialize: function() {
		this.lu = new global.GSLog(this.SLA_ASYNC_QUEUE_LOG, this.type);
		this.lu.includeTimestamp();
	},

	queueTask: function(gr) {
		if (!gr || !gr.isValidRecord()) {
			this.lu.logError("queueTask: no record supplied");
			return;
		}

		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("queueTask: adding " + gr.sys_meta.label + " " + gr.getDisplayValue() + " to queue for update number " + gr.getValue("sys_mod_count"));

		var modCount = gr.getValue("sys_mod_count");
		var internalCheckpoint = this._getLatestCheckpoint(gr.getTableName(), gr.getUniqueValue());
		internalCheckpoint = internalCheckpoint === -1 && modCount + '' === '0' ? 0 : internalCheckpoint;

		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("queueTask: internalCheckpoint " + internalCheckpoint + " modCount: " + modCount);

		var slaQueueGr = new GlideRecord(SLAAsyncSNC.SLA_ASYNC_QUEUE);
		slaQueueGr.setValue("document_table", gr.getRecordClassName());
		slaQueueGr.setValue("document_id", gr.getUniqueValue());
		slaQueueGr.setValue("update_number", modCount);
		slaQueueGr.setValue("internal_checkpoint", internalCheckpoint);
		var sysId = slaQueueGr.insert();

		if (!sysId) {
			this.lu.logError("queueTask: failed to queue entry for record " + gr.sys_meta.label + " " + gr.getDisplayValue() + " at update number " + gr.getValue("sys_mod_count"));
			return;
		}
		
		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("queueTask: added entry to queue with sequence number " + slaQueueGr.getValue("sequence"));
	},
	
	processQueue: function(jobGr) {
		if (!this._isValidJob(jobGr)) {
			this.lu.logError("processQueue: invalid record supplied\n-->  jobGr.isValidRecord()=" + jobGr.isValidRecord() +
								"\n--> jobGr.getRecordClassName()=" + jobGr.getRecordClassName());
			return;
		}

		if (this.lu.atLevel(GSLog.DEBUG))
			this.lu.logDebug("processQueue: processing entries for job " + jobGr.getDisplayValue());
		
		var slaAsyncQueueGr = this._getQueue(jobGr);
		while (slaAsyncQueueGr.next()) {
			slaAsyncQueueGr.setValue("state", "processing");
			slaAsyncQueueGr.update();

			var processingException = false;
			
			var documentId = slaAsyncQueueGr.getValue("document_id");
			var documentTable = slaAsyncQueueGr.getValue("document_table");
			var updateNumber = slaAsyncQueueGr.getValue("update_number");
			var internalCheckpoint = slaAsyncQueueGr.getValue("internal_checkpoint");

			if (!documentId || !documentTable || !updateNumber) {
				if (this.lu.atLevel(GSLog.WARN))
					this.lu.logWarn("processQueue: failed to process entry with sys_id = " + slaAsyncQueueGr.getUniqueValue() + 
									" due to missing values:\n   document_id = " + documentId +
									"\n   document_table = " + documentTable +
									"\n   update_number = " + updateNumber +
									"\n   internalCheckpoint = " + internalCheckpoint);
				processingException = true;
			}

			if (!processingException) {
				try {
					if (this.lu.atLevel(GSLog.DEBUG))
						this.lu.logDebug("processQueue: documentId: " + documentId + " documentTable: " + documentTable);

					new TaskSLAController(documentId, documentTable, updateNumber, internalCheckpoint).runNow();
				} catch(err) {
					processingException = true;
					this.lu.logError("processQueue: failed to process entry for " + documentTable + " " +
										documentId + " and update number " + updateNumber);
				}
			}

			if (processingException) {
				slaAsyncQueueGr.setValue("state", "error");
				slaAsyncQueueGr.update();
				continue;
			}
				
			slaAsyncQueueGr.deleteRecord();

			if (this.lu.atLevel(GSLog.DEBUG))
				this.lu.logDebug("processQueue: processed entry for " + slaAsyncQueueGr.getValue("document_table") + " " +
									slaAsyncQueueGr.getValue("document_id") + " and update number " + slaAsyncQueueGr.getValue("update_number"));
		}
	},

	isTaskQueued: function(documentId, excludeId, states) {
		if (!documentId)
			return false;

		var slaAsyncQueueGr = new GlideRecord(SLAAsyncSNC.SLA_ASYNC_QUEUE);
		slaAsyncQueueGr.addQuery("document_id", documentId);
		if (!JSUtil.nil(excludeId))
			slaAsyncQueueGr.addNullQuery("sys_trigger").addOrCondition("sys_trigger", "!=", excludeId);
		if (states)
			slaAsyncQueueGr.addQuery("state", states);
		else
			slaAsyncQueueGr.addQuery("state", "IN", "ready,queued,processing");
		slaAsyncQueueGr.query();
		
		return slaAsyncQueueGr.hasNext();
	},

	_getLatestCheckpoint: function(tableName, sysId) {
		if (!tableName || !sysId)
			return -1;

		// Retrieve that latest checkpoint for the mod_count as it is the put into the queue when it was updated
		var ga = new GlideAggregate('sys_audit');
		ga.addQuery('tablename', tableName);
		ga.addQuery('documentkey', sysId);
		ga.addAggregate('COUNT');
		ga.setWorkflow(false);
		ga.groupBy('internal_checkpoint');
		ga.orderByDesc('internal_checkpoint');
		ga.query();
		if (ga.next())
			return ga.getValue('internal_checkpoint') + '';

		return -1;
	},

	_getQueue: function(jobGr) {
		var slaAsyncQueueGr = new GlideRecord(SLAAsyncSNC.SLA_ASYNC_QUEUE);
		slaAsyncQueueGr.setWorkflow(false);
		/* this query checks for "processing" state  as well as queued in case we've got an async job
		   that has been restarted after a node/instance restart in which case we may well have a 
		   record marked as "processing" that still needs to be processed */
		slaAsyncQueueGr.addQuery("state", "IN", "processing,queued");
		slaAsyncQueueGr.addQuery("sys_trigger", jobGr.getUniqueValue());
		slaAsyncQueueGr.orderBy("sequence");
		slaAsyncQueueGr.query();

		return slaAsyncQueueGr;
	},

	_isValidJob: function(jobGr) {
		if (!jobGr || !jobGr.isValidRecord())
			return false;
		
		if (jobGr.getRecordClassName() !== "sys_trigger")
			return false;
		
		return jobGr.getValue("trigger_type") === "0";
	},

	type: 'SLAAsyncQueueSNC'
};
