var CurrencyRateSyncUtil = Class.create();
CurrencyRateSyncUtil.prototype = {
    initialize: function() {
		this.JOB_NAME = 'Update Currency Conversion Rates';
		this.RETRY_JOB_NAME = 'Retry ' + this.JOB_NAME;
    },

	updateAllRates: function() {
		var rateRetrievalUtil = new sn_currency.ECBRateRetrievalUtil();
		var successful = rateRetrievalUtil.updateAllRates();

		if (!successful && this.shouldRetry())
			this.spawnRetryJob();
	},

	// Only retry rate sync if next regularly scheduled job is not within 16 hours of running.
	shouldRetry: function() {
		var sixteenHours = 16 * 60 * 60;
		var threshold = new GlideDateTime();
		threshold.addSeconds(sixteenHours);

		var gr = new GlideRecord('sys_trigger');
		var qc = gr.addQuery('name', this.JOB_NAME);
		qc.addOrCondition('name', this.RETRY_JOB_NAME);
		gr.addQuery('next_action', '<', threshold);
		gr.addQuery('state', '!=', 1); // Running state
		gr.query();

		return !gr.hasNext();
	},

	spawnRetryJob: function() {
		var gr = new GlideRecord('sys_trigger');
		gr.initialize();

		gr.setValue('name', this.RETRY_JOB_NAME);
		gr.setValue('trigger_type', 0); // run_once

		var oneHourMs = 60 * 60 * 1000;
		var oneHourFromNow = new GlideDateTime();
		oneHourFromNow.add(oneHourMs);

		gr.setValue('next_action', oneHourFromNow);
		gr.setValue('script', 'new CurrencyRateSyncUtil().updateAllRates()');

		var jobId = gr.insert();
		gs.info('Scheduled retry job: ' + jobId + ' for ' + this.JOB_NAME + ' to run at: ' + gr.next_action);
	},

    type: 'CurrencyRateSyncUtil'
};
