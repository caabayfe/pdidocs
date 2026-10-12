var SLAAsyncQueueHealthCheckSNC = Class.create();
SLAAsyncQueueHealthCheckSNC.prototype = {
    initialize: function() {
    },

	check: function() {
		this._recoverRecordsWithNoJob();
		this._recoverRecordsWithNonExistentJob();
	},

	/* Set back to "ready" any records with a state of "queued" or "processing" but do not have an SLA Async Job
	   Records with these values will never be processed by the delegator again so need to be updated back to "ready"

	   An example of when this can happen is if a node is restarted while an SLA Async job is running */
	_recoverRecordsWithNoJob: function() {
		var slaAsyncQueueGr = new GlideRecord(SLAAsyncSNC.SLA_ASYNC_QUEUE);
		slaAsyncQueueGr.addQuery("state", "IN", "queued,processing");
		slaAsyncQueueGr.addNullQuery("sys_trigger");

		this._setRecordsToReady(slaAsyncQueueGr);
	},

	/* Set back to "ready" any records with a state of "queued" or "processing" which reference an SLA Async Job that
	   no longer exists

	   An example of when this can happen is if a node crashes while an SLA Async job is running */
	_recoverRecordsWithNonExistentJob: function() {
		var slaAsyncQueueGr = new GlideAggregate(SLAAsyncSNC.SLA_ASYNC_QUEUE);
		slaAsyncQueueGr.addQuery("state", "IN", "ready,queued,processing");
		slaAsyncQueueGr.addNotNullQuery("sys_trigger");
		slaAsyncQueueGr.setWorkflow(false);
		slaAsyncQueueGr.groupBy("sys_trigger");
		slaAsyncQueueGr.query();

		while (slaAsyncQueueGr.next()) {
			var triggerJobId = slaAsyncQueueGr.getValue("sys_trigger");
			if (this._triggerJobExists(triggerJobId))
				continue;

			var recoverSlaAsyncQueueGr = new GlideRecord(SLAAsyncSNC.SLA_ASYNC_QUEUE);
			recoverSlaAsyncQueueGr.addQuery("state", "IN", "ready,queued,processing");
			recoverSlaAsyncQueueGr.addQuery("sys_trigger", triggerJobId);

			this._setRecordsToReady(recoverSlaAsyncQueueGr);			
		}
	},

	_triggerJobExists: function(triggerJobId) {
		if (!triggerJobId)
			return false;
		
		var sysTriggerGr = new GlideRecord("sys_trigger");
		sysTriggerGr.setWorkflow(false);
		return sysTriggerGr.get(triggerJobId);
	},

	_setRecordsToReady: function(slaAsyncGr) {
		if (!slaAsyncGr || typeof slaAsyncGr.getTableName !== "function" || slaAsyncGr.getTableName() !== SLAAsyncSNC.SLA_ASYNC_QUEUE)
			return;

		slaAsyncGr.setWorkflow(false);
		slaAsyncGr.setValue("sys_trigger", "");
		slaAsyncGr.setValue("state", "ready");
		slaAsyncGr.updateMultiple();
	},

	type: 'SLAAsyncQueueHealthCheckSNC'
};
