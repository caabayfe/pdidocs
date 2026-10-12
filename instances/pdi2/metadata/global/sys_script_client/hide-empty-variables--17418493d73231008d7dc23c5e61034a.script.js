function onLoad() {
	var selector = '[id*="element\.wf_context\.workflow\.vars"]';
	var varLength = document.querySelectorAll(selector).length;
	if(varLength == 0) {
		g_form.setSectionDisplay('workflow_inputvalues', false)
	}
	
}
