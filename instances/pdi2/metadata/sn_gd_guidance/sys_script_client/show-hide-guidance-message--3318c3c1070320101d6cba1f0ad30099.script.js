function onLoad() {
   //Type appropriate comment here, and begin script below
   if(g_form.isNewRecord())
		g_form.setDisplay('guidance_message', false);
	else
		g_form.setDisplay('guidance_message', true);
}
