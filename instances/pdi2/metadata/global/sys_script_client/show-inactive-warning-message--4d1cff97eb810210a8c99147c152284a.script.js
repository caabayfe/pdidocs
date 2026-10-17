function onLoad() {
   var active=g_form.getValue('active');
   if (active === 'false'){
	g_form.addWarningMessage(getMessage("This policy is inactive and none of the policy rules will be run"));
   }
}
