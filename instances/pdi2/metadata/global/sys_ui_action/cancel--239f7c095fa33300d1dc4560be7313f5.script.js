var gr = new GlideRecord(global.MLBaseConstants.ML_SOLUTION);
gr.addQuery(global.MLBaseConstants.SOL_DEFINITION_REF_FIELD, current.sys_id);
gr.orderByDesc('sys_created_on');
gr.query();
if (gr.next())
	new sn_ml.TrainingRequest().cancelTraining(gr.sys_id);
