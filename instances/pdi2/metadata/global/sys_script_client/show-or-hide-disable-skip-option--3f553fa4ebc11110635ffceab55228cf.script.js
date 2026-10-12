function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	var contentGr = g_form.getReference('content');
	var sysClassName = contentGr.getValue('sys_class_name');
	
	var providerNotificationAjax = new GlideAjax('ProviderNotificationAjax');
	providerNotificationAjax.addParam('sysparm_name', 'shouldShowDisableSkipForContentClass');
	providerNotificationAjax.addParam('sysparm_content_class', sysClassName);
	
	providerNotificationAjax.getXMLAnswer(shouldShowDisableSkip);
	
	function shouldShowDisableSkip(response) {
		g_form.setVisible('disable_skip', response === 'true');
	}
}
