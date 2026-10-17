var ToggleScopingLogs = Class.create();
ToggleScopingLogs.prototype = {
    initialize: function() {
    },

	startLoggingForMinutes: function(mins) {
		if (!mins || isNaN(mins)) throw new Error('Invalid input. Specify a number from 1 to 15 representing logging TTL in minutes.');

        mins = Math.min(Math.abs(mins), 15);

		sn_log.GlideLogConfigurator.addTimeLimitedConfiguration('com.glide.sys.fencing', 'DEBUG', mins);
		sn_log.GlideLogConfigurator.addTimeLimitedConfiguration('com.glide.script.fencing', 'DEBUG', mins);
		sn_log.GlideLogConfigurator.addTimeLimitedConfiguration('com.glide.script.glide_elements.GlideElementReference', 'DEBUG', mins);

		gs.info('Started logging scoping workflows for ' + mins + ' minutes.');
	},

	stopLogging: function() {
		sn_log.GlideLogConfigurator.cleanupTimeLimitedConfigurations();
	},

    type: 'ToggleScopingLogs'
};
