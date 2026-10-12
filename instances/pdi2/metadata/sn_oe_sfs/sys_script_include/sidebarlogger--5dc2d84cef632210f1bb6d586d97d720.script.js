var SidebarLogger = Class.create();
SidebarLogger.prototype = {
	LOGGER_NAME: "Sidebar",
	CONTEXT: {
		app: 'sn-oe-sfs',
	},
	initialize: function() {
	},
	withName: function(name) {
		this.LOGGER_NAME = [this.LOGGER_NAME, name].join('.');
		return this;
	},
	createLogger: function() {
		return new sn_log.GlideLogger(this.LOGGER_NAME, this.CONTEXT, Object.keys(this.CONTEXT));
	},
	type: 'SidebarLogger'
};
