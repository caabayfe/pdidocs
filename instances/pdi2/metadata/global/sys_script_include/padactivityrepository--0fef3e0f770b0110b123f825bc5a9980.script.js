var PADActivityRepository = Class.create();
PADActivityRepository.prototype = {
    initialize: function() {},
	deleteRecord: function(sysId) {
		var gr = new GlideRecordSecure(PADConstants.TABLES.PD_ACTIVITY);
		gr.get(sysId);
		gr.deleteRecord();
		return sysId;
	},
    type: 'PADActivityRepository'
};
