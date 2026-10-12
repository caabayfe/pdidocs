function onLoad() {
   //Show the display message only for service now created help content. 
	if (g_form.getValue('snc_created') == "true" ) { 
		g_form.addInfoMessage("For help provided by ServiceNow, you can only modify the Active field. To make other changes, use the Copy button to copy the content.");
	   }
}
