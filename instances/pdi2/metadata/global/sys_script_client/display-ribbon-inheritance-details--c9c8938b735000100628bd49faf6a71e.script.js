function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	// Display message when admin selects a table for configuration
	if (g_form.hasField("table")) {
		var message = new GwtMessage().getMessage("If this table has no configured ribbon settings, it inherits the parent table ribbon configuration. If this table is configured to use specific ribbon settings, those settings take precedence. {0}", '<a href="https://docs.servicenow.com/?CSHelp:Set-up-ribbons-in-Workspace" target="_blank"> More Info</a>');
		
		g_form.addInfoMessage(message);
	}	
	
}
