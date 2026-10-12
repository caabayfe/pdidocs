function onLoad() {
   if (g_scratchpad.breakdownDataExists === true)
	   g_form.addInfoMessage(getMessage('Breakdown data exists for this breakdown definition and so it cannot be modified except for the "Active" field and related SLA Definitions')); 
}
