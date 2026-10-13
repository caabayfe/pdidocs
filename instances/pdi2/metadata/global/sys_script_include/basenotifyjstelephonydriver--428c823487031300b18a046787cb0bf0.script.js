var BaseNotifyJsTelephonyDriver = Class.create();
BaseNotifyJsTelephonyDriver.prototype = {
	CAPABILITIES: {
		SHOW_SPEAKERS: 'show_speakers'
	},

	initialize: function () {
		var type = this.type;
		this.logger = {
			error: function () {
				var args = Array.prototype.slice.call(arguments);
				args[0] = type + args[0];
				gs.error.apply(gs, args);
			},
			warn: function () {
				var args = Array.prototype.slice.call(arguments);
				args[0] = type + args[0];
				gs.warn.apply(gs, args);
			},
			info: function () {
				var args = Array.prototype.slice.call(arguments);
				args[0] = type + args[0];
				gs.info.apply(gs, args);
			}
		};
	},

	getName: function () {
		return this.type;
	},

	type: 'BaseNotifyJsTelephonyDriver'
};
