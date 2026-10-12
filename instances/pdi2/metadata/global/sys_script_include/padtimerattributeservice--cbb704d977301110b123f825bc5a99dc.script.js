var PADTimerAttributeService = Class.create();
PADTimerAttributeService.prototype = {
    initialize: function(opts) {
		this.timerAttributeRepository = (opts && opts.timerAttributeRepository) || new PADTimerAttributeRepository();
    },
	getTimerAttributes: function(params) {
		var source = params.source;
		var sourceType = params.sourceType;
		if (gs.nil(source))
			return {
				type: PADConstants.Errors.GENERIC_ERROR,
				message: 'Information missing to get start with delay data'
			};
		if (sourceType === 'lane')
			params.sourceType = PADConstants.TABLES.PD_LANE;
		else if (sourceType === 'activity')
			params.sourceType = PADConstants.TABLES.PD_ACTIVITY;
		
		try {
			return this.timerAttributeRepository.getTimerAttributes(params);
		} catch (err) {
			return {
				type: PADConstants.Errors.GENERIC_ERROR,
				message: err
			};
		}
	},
    type: 'PADTimerAttributeService'
};
