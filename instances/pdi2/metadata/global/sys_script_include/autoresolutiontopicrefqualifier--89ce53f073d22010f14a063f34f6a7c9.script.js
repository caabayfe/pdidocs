var AutoResolutionTopicRefQualifier = Class.create();
AutoResolutionTopicRefQualifier.prototype = {
	
	initialize: function() {
	},
	
	getTopics: function(autoResConfigSysId) {
		var supportedTopicSysIDList = [];
		var autoResConfigGr = new GlideRecord('sys_cs_auto_resolution_configuration');
		autoResConfigGr.get(autoResConfigSysId);

		supportedTopicSysIDList = AutoResolutionUtil.getActiveTopicsForDomain(autoResConfigGr);
		return 'sys_idIN' + supportedTopicSysIDList.join(',');
	},

    type: 'AutoResolutionTopicRefQualifier'
};
