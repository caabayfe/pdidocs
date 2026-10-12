function process() {
	if(g_form.getValue('nlu_enabled') == 'false') {
		g_form.setDisplay('nlu_provider',false);	
	} else {
		g_form.setDisplay('nlu_provider',true);	
	}		   
}

function onLoad() {
	process();   
}
