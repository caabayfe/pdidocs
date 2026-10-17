function onLoad(){
	if (!g_form.hasField('description'))
		return;
	
	if (g_form.isNewRecord())
	  g_form.setVisible('description', false);
}
