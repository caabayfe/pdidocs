function onLoad() {
   var type = g_form.getValue('relationship_type')
   if(type === '2' || type === '1')
	   g_form.setVisible('relationship', false);
	else
		g_form.setVisible('relationship', true);
}
