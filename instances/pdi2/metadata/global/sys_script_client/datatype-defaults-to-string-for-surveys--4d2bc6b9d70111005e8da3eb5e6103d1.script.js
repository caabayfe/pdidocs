function onLoad() {
   if (g_form.isNewRecord() && viewType("survey")) 
	   g_form.setValue("datatype","string");
}

function viewType(viewNameToMatch) {
	var objView = document.getElementById('sysparm_view');
	var currentViewName = objView.getAttribute('value');

	if (currentViewName.toLowerCase() == viewNameToMatch)
		return true;
	return false;
}
