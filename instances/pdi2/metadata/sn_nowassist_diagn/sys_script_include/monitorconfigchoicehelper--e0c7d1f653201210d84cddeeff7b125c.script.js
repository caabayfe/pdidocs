var MonitorConfigChoiceHelper = Class.create();
MonitorConfigChoiceHelper.prototype = {
    initialize: function() {
    },

	process: function () {
		return ['sys_gen_ai_log_metadata', 'sys_one_extend_rate_limit_violations'];
	},

    type: 'MonitorConfigChoiceHelper'
};
