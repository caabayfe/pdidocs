if (!pm.isZboot()) {
	var dependent = "trainer.name";
	
	
	//update dependent, dependent_on_field, use_dependent_field values for training frequency field on solution defintion.
	var sys_dict = new GlideRecord("sys_dictionary");
	sys_dict.addEncodedQuery('name=ml_solution_definition^element=training_frequency');
	sys_dict.query();
	if (sys_dict.next()) {
		sys_dict.setValue('dependent','trainer.name');
		sys_dict.setValue('dependent_on_field','trainer.name');
		sys_dict.setValue('use_dependent_field','true');
		sys_dict.update();
	}
}
