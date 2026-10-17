var WdfLogger = Class.create();
WdfLogger.prototype = {
    initialize: function() {
    },

	debug: function(message) {
		var debugProperty = gs.getProperty("sn_wdf_token.debug");
		var isDebugEnabled = debugProperty === true || debugProperty === "true";
		if (isDebugEnabled) {
			gs.info("WDF Debug: " + message);
		}
	},

	info: function(message) {
		gs.info("WDF Info: " + message);
	},

	warn: function(message) {
		gs.warn("WDF Warn: " + message);
	},

	error: function(message) {
		gs.error("WDF Error: " + message);
	},

    type: 'WdfLogger'
};
