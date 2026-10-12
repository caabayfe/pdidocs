var StopWatch = Class.create();
StopWatch.prototype = {
    initialize: function() {
		this.timers = {};
    },
	time: function (timerName) {
		this.timers[timerName] = new GlideDateTime().getNumericValue();
	},
	timeEnd: function(timerName, prefix) {
		var startTime = this.timers[timerName];
		var logPrefix = '[IDE][' + prefix + ']' || '';
		if (startTime) {
			var now = new GlideDateTime();
			now.subtract(startTime);
			var msDuration = now.getNumericValue();
			gs.info(logPrefix + timerName + ' took ' + msDuration + 'ms.' );
			delete this.timers[timerName];
		} else {
			gs.info(logPrefix + 'no timer by the name ' + timerName + ' was called with \'time\' first');
		}
	},
    type: 'StopWatch'
};
