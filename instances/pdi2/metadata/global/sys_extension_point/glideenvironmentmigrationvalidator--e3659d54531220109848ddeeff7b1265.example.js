var GlideEnvironmentMigrationValidator = Class.create();
GlideEnvironmentMigrationValidator.prototype = {
    initialize: function() {
    },

    validate: function(/*GlideEnvironmentFlags*/ flags) {
        var logs = [];
		var log = {
			'severity': 'warn', // warn, error, fatal
			'app_id': 'com.glide.id1', // the plugin/application where the error is found
			'message': 'Potential incompatibility, please refer to KB12345' // message with details for remediation
		};
		logs.add(log);

        return logs;
    },

    type: 'GlideEnvironmentMigrationValidator'
};
