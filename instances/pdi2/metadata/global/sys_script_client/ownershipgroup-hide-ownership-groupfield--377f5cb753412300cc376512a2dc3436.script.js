function onLoad() {
	if(!g_form.hasField("ownership_group"))
	 return;
	
	if(g_scratchpad.isOwnershipEnabled && g_scratchpad.isOwnershipEnabled == "false" && g_form.getValue("ownership_group") == "")
	   g_form.setDisplay("ownership_group",false);
	
}
