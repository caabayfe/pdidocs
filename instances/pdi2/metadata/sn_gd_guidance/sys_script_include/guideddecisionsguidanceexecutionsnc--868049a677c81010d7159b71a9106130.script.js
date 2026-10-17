var GuidedDecisionsGuidanceExecutionSNC = Class.create();
GuidedDecisionsGuidanceExecutionSNC.prototype = {
    initialize: function() {
		this.constantUtil = new sn_gd_guidance.GuidanceConstantsSNC;
		this.guidedDecisionsGuidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();
    },

	skipGuidanceExecution: function(recommendedBy, recommender){
		gs.info("recommendedBy " + recommendedBy);
		gs.info("recommender  "+ recommender);
		var guidanceUtil = new sn_gd_guidance.GuidedDecisionsGuidanceUtilSNC();
		var recommenderhandler = guidanceUtil.getRecommenderHandler(recommender);
		if(!recommenderhandler.isGuidanceActionAllowed(recommendedBy)){
					return {
						actionStatus: this.constantUtil.ERROR,
						statusCode: this.constantUtil.ERROR_405,
						errorMessage: this.constantUtil.ERROR_405_MESSAGE
					};
				}
		var curr_state = this.guidedDecisionsGuidanceModel.getGuidanceHistoryRecord(recommender,recommendedBy).state;
		var state = this.constantUtil.STATE_SKIPPED;
		if(curr_state == this.constantUtil.STATE_IN_ERROR) {
			state = this.constantUtil.STATE_ERROR_SKIPPED;
		}
		this.guidedDecisionsGuidanceModel.updateGHStateUsingRecommender(
			recommendedBy,
			recommender,
			state);
		//cancel corresponding subflow;
	},
	updateGuidanceInstanceExecution : function(recommender, recommendedBy,action_sys_id,inputData){
		gs.info("recommendedBy : " + recommendedBy);
		gs.info("recommender  : "+ recommender);
		gs.info("action sys Id : "+ action_sys_id)
		gs.info("Input Data : ",inputData);
		var result = this.guidedDecisionsGuidanceModel.updateGuidanceInstanceExecution(recommender, recommendedBy,action_sys_id,inputData);
		return result;
	},

    type: 'GuidedDecisionsGuidanceExecutionSNC'
};
