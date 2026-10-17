var SNHelpGuidanceController = Class.create();
SNHelpGuidanceController.prototype = {
	
    initialize: function() {
		
		this._helpConstants = new SNHelpConstantProvider();
		this._stepCtrl = new SNHelpGuidanceStepController();
		this._dbCtrl = new SNHelpDBController(this._helpConstants.tables.guidance);
		this._helpUtil = new SNHelpUtil();
    },
	
	/*
	* @param guidance id
	* @param guidance type
	*/
    getGuidance: function(sys_id, fields) {
		var guidanceRecord;
		
		if (!sys_id) {
			this._helpUtil.setError(this.type,this._helpConstants.errorMessages.empty_sys_id);
			return null;
		}
		guidanceRecord = this._dbCtrl.getById(sys_id, fields);
		
		if (!guidanceRecord) {
			this._helpUtil.setError(this.type, this._helpConstants.errorMessages.no_records, sys_id);
			return null;
		} 
		
		guidanceRecord.steps = this._stepCtrl.getSteps(sys_id, guidanceRecord.type) || [];
		
		return { guidance: guidanceRecord };
	},
	
	isGlobal : function(sys_id) {
		var guidance = this._dbCtrl.getById(sys_id, ["type"]);
		
		return guidance && guidance.type === this._helpConstants.setupType.GLOBAL_SETUP;
	},
	
    type: 'SNHelpGuidanceController'
};
