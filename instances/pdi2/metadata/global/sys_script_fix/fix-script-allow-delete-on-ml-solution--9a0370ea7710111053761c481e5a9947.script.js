var gr = new GlideRecord('sys_db_object');
	gr.addQuery('name','ml_solution');
	gr.query();
	if(gr.next()){
		gr.delete_access = true;
		gr.update();
		gs.info('Upgrade Script: Delete Application Access Updated for ml_solution table');
}
