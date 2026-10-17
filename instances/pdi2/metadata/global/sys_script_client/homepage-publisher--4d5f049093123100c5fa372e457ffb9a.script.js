function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	g_form.hideFieldMsg('source_field', true);
	_hideRelatedLists();
	switch (newValue) {
		case '2':
			g_form.showRelatedList('sys_ui_hp_reference');
			break;
		
		case '3':
			g_form.showRelatedList('sys_ui_hp_date');
			break;
		
		case '6':
			g_form.showRelatedList('sys_ui_hp_cascading_filter');
			break;
		
		default:
			break;
	}
	
	g_form.setSectionDisplay('choice_list', newValue == '1');
	g_form.setSectionDisplay('reference', newValue == '2');
	g_form.setSectionDisplay('date', newValue == '3');
	g_form.setSectionDisplay('group', newValue == '4');
	g_form.setSectionDisplay('boolean', newValue == '5');	
}

function _hideRelatedLists(){
	var relatedLists = ['sys_ui_hp_reference','sys_ui_hp_date','sys_ui_hp_cascading_filter'];
	relatedLists.forEach(function(rlist){
		g_form.hideRelatedList(rlist);
	});
}
