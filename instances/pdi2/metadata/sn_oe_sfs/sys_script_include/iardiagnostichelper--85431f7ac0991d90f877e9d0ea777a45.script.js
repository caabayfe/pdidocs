var IARDiagnosticHelper = Class.create();

IARDiagnosticHelper.prototype = {
	LOGGER_NAME: "sn_cs.auto_resolution",
	CONTEXT: {
		app: 'CI',
		track: 'Auto-Resolution',
		usage: 'Diagnostic-content',
	},
	
	initialize: function() {
	},
	
	createLogger: function() {
		return new sn_log.GlideLogger(this.LOGGER_NAME, this.CONTEXT, Object.keys(this.CONTEXT));
	},
	
	type: 'IARDiagnosticHelper'
};
