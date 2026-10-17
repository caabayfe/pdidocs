function onLoad() { 
	var objView = document.getElementById('sysparm_view'); 
	var strView = objView.getAttribute('value'); 
	if (strView.toLowerCase() == 'survey') { 
		g_form.removeOption('datatype', 'rating'); 
		g_form.removeOption('datatype', 'duration'); 
	} 
	
	// Rating not available, remove always
	g_form.removeOption('datatype', 'rating'); 
}
