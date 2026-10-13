function onChange() {
   if (g_form.getValue('type') == 'Distributed')
		g_form.addInfoMessage(getMessage("Distributed cluster can only be used for Operational Intelligence extension"));
   
}
