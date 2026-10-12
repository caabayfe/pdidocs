function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === 'true') {
		g_form.showFieldMsg("enable_unauthenticated_user_tracking", getMessage("Applicable laws may require you to notify users that you are tracking their usage for analysis. You can display a legal notice by creating an announcement in the portal. For reference, review the default text of the Privacy Notice announcement."), "info");
      return;
   }
   
}
