function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }

   // Describe workspace field on change
   
	if(g_form.hasField("workspace")) {
		g_form.addInfoMessage(getMessage("A ribbon setting can apply to all workspaces or to one specific workspace. If the Workspace field is empty, the ribbon setting applies to all workspaces. Otherwise it applies to the selected workspace."));
	}
}
