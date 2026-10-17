function onLoad() {
	var view = getView();
	if (view == 'manage_breakdown_mapping') {
		g_form.setMandatory('facts_table', false);
		g_form.setReadOnly('facts_table', true);
		g_form.setReadOnly('breakdown', true);
		
		
		// Hide info icon of breakdown
		var breakDownInfoIcon = document.getElementById('view.pa_breakdown_mappings.breakdown');
		if(breakDownInfoIcon)
			breakDownInfoIcon.style.display = 'none';
		
		// Hide related list
		var relatedList = document.querySelector('.related_links_container');
		if(relatedList)
			relatedList.style.display = 'none';
		
		// Hide show schema map 
		var showShemaMap = document.querySelector('a#b314de33eb03310065deac6aa206fe14');
		if(showShemaMap)
			showShemaMap.style.display = 'none';
		
		// Hide related list heading
		var relatedListHeading = document.querySelector('h2.related_links');
		if(relatedListHeading)
			relatedListHeading.style.display = 'none';
	}
}
