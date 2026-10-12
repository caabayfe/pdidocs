function onLoad() {
   //Type appropriate comment here, and begin script below
	if(g_form.getValue('type') == "7")
		g_form.setLabelOf('mandatory', getMessage('Selection Required'));
}
