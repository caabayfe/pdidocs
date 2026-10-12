(function(){

	gs.info('Fix Script: Removing related list entry for problem_task.assignment_group');

	var gr = new GlideRecord('sys_ui_related_list');
	var queryString = 'name=sys_user_group^view.name=sow';
	gr.addEncodedQuery(queryString, true);
	gr.query();

	if (gr.next()) {
		gs.info('Fix Script: Deleting related list entry for problem_task.assignment_group');
		// use GlideQuery to avoid cross scope issues with delete
		var gr2 = new global.GlideQuery('sys_ui_related_list_entry')
			.where('list_id', gr.sys_id)
			.where('related_list', 'problem_task.assignment_group')
			.limit(1)
			.deleteMultiple() // GlideQuery only has a deleteMultiple, so make sure to limit it to one result
			;
	}
})();
