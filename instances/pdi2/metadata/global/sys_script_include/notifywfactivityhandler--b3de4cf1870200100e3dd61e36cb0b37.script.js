var NotifyWFActivityHandler = Class.create();
NotifyWFActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
	initialize: function() {
		WFActivityHandler.prototype.initialize.call(this);
	},

	onUpdate: function() {},

	/**
	 * Call disconnected
	 */
	onCompleted: function() {
		this.cancelWorkflow();
	},

	/**
	 * Call is ringing
	 */
	onRinging: function() {},

	/**
	 * Call is in progress. Both parties are connected
	 */
	onInProgress: function() {},

	/**
	 * Called party did not answer
	 */
	onNoAnswer: function() {
		this.cancelWorkflow();
	},

	/**
	 * Called party is busy
	 */
	onBusy: function() {
		this.cancelWorkflow();
	},

	/**
	 * Something went wrong
	 */
	onFailed: function() {
		this.cancelWorkflow();
	},

	cancelWorkflow: function() {
		var states = ['finished', 'cancelled', 'error'];
		if (states.indexOf(activity.state + '') === -1) {
			activity.state = 'cancelled';
			new Workflow().cancel(current);
		}
	},

	type: 'NotifyWFActivityHandler'
});
