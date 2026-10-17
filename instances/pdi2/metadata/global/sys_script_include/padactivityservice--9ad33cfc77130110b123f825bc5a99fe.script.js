var PADActivityService = Class.create();
PADActivityService.prototype = {
    initialize: function(opts) {
		this.repository = (opts && opts.repository) || new PADActivityRepository();
    },
	deleteRecord: function(sysId) {
		return this.repository.deleteRecord(sysId);
	},
    type: 'PADActivityService'
};
