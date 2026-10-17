function onSubmit() {
	top.snhelp = top.snhelp || {};
	top.snhelp.addContentMsg = "";
	if(g_form.isNewRecord() && g_form.getActionName() === "sysverb_update_and_stay") {
		top.snhelp.addContentMsg = getMessage("Step saved successfully. You may now add content for this step.");
	} 
}
