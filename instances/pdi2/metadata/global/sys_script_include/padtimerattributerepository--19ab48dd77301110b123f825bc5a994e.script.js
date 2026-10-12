var PADTimerAttributeRepository = Class.create();
PADTimerAttributeRepository.prototype = {
    initialize: function() {
		var padUtils = new PADUtilsSI();
		this.isAuthorizedUser = padUtils.isPADAuthorizedUser();
    },
	_createTimerAttributeObj: function(gr) {
		var padUtils = new PADUtilsSI();
		var obj = {};
		obj.sys_id = padUtils.getFieldReturnValue(gr, 'sys_id');
		obj.active = padUtils.getFieldReturnValue(gr, 'active');
		obj.duration_type = padUtils.getFieldReturnValue(gr, 'duration_type');
		obj.timer_duration = padUtils.getFieldReturnValue(gr, 'timer_duration');
		obj.timer_schedule = padUtils.getFieldReturnValue(gr, 'timer_schedule');
		obj.timer_percentage = padUtils.getFieldReturnValue(gr, 'timer_percentage');
		obj.percentage_timer_input_datetime = padUtils.getFieldReturnValue(gr, 'percentage_timer_input_datetime');
		obj.timer_relative_duration_operator = padUtils.getFieldReturnValue(gr, 'timer_relative_duration_operator');
		obj.timer_relative_duration_datetime = padUtils.getFieldReturnValue(gr, 'timer_relative_duration_datetime');
		
		return obj;
	},
	getTimerAttributes: function(params) {
		if (!this.isAuthorizedUser)
			throw (gs.getMessage('You are unauthorized to perform this action.'));

		var source = params.source;
		var sourceType = params.sourceType;
		if (gs.nil(source) || gs.nil(sourceType))
			throw (gs.getMessage('Missing required field: source or source_type.'));
		
		var timerAttributesGr = new GlideRecord(PADConstants.TABLES.PD_TIMER_ATTRIBUTE);
		timerAttributesGr.addQuery('source_type', sourceType);
		timerAttributesGr.addQuery('source', source);
		timerAttributesGr.query();
		
		var response = {};
		while(timerAttributesGr.next())
			response = this._createTimerAttributeObj(timerAttributesGr);
		
		return response;
	},
    type: 'PADTimerAttributeRepository'
};
