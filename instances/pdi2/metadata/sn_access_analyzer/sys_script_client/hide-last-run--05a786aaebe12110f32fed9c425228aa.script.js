function onLoad() {
   if(g_form.isNewRecord()) {
	   g_form.setVisible('last_run', false);
   }
   g_form.setReadOnly('last_run', true);
}
