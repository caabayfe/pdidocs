var gr = new GlideRecord('ml_solution');
gr.addQuery('solution_definition', current.sys_id);
gr.orderByDesc('sys_created_on');
gr.query();
if (gr.next())
	new sn_ml.TrainingRequest().cancelTraining(gr.sys_id);
