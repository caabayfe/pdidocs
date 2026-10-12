function onSubmit() {
   if (g_form.getActionName() == 'sysverb_delete') {
	 var msg = getMessage("Are you sure you want to permanently delete the portfolio and its taxonomy layers and nodes? This action cannot be reverted. All of the portfolio's services and offerings will remain intact and not be deleted.");
	 return confirm(msg);
	}
}
