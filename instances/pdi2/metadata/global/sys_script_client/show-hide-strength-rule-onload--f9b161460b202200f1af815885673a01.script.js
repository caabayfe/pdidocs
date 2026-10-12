function onLoad() { 
	var checkbox = g_form.getBooleanValue('enable_password_strength'); 
	if (checkbox) {  
		g_form.setDisplay('strength_rule', true); 
	}  
	else {  
		g_form.setDisplay('strength_rule', false);  
	} 
}
