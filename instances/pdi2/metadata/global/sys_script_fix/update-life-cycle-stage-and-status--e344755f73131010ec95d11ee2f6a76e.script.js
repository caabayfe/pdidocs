var gr = new GlideRecord('cmdb_ci_business_process');
gr.query();
gr.setWorkflow(false);
gr.setValue('life_cycle_stage','Ideation');
gr.setValue('life_cycle_stage_status','Under Evaluation');
gr.updateMultiple();
