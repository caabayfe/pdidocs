function onLoad() {
   if (g_scratchpad.breakdownDataExists === true)
	   g_form.addInfoMessage(getMessage("Breakdown data exists for this breakdown definition and so the breakdown fields cannot be modified")); 
}
