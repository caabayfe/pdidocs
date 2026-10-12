(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var msd = new GlideRecord(global.MLBaseConstants.ML_CAPABILITY_DEF_BASE);
	gs.info("solution definition: " + request.pathParams.solution_name);
	msd.addQuery("solution_name", request.pathParams.solution_name);
	msd.query();
	if(msd.next()){
		var sol_def_id = msd.sys_id;
		if(new MLRequestSchedule().isCapabilitySolutionCurrentlyTraining(sol_def_id) == true  && gs.hasRole('ml_admin')){
			var gr = new GlideRecord(global.MLBaseConstants.ML_SOLUTION);
			gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, sol_def_id);
			gr.orderByDesc('sys_created_on');
			gr.query();
			if (gr.next())
				gs.info("Currently Training Solution : " + gr.sys_id);
				new sn_ml.TrainingRequest().cancelTraining(gr.sys_id);
		}
	}

})(request, response);
