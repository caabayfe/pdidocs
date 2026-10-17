function onLoad() {
   //Type appropriate comment here, and begin script below
   var type = g_form.getValue('type');
   if(type !== 'global' || !type) {
	g_form.setMandatory('definition', false);
	g_form.setDisplay('definition', false);
   } else {
	g_form.setMandatory('definition', true);
	g_form.setDisplay('definition', true);
   }
}
