var ProviderNotificationAjax = Class.create();
ProviderNotificationAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  
	shouldShowDisableSkipForContentClass: function() {
		
		// Check if com.glide.cs.actionable.notification plugin is active
		var pluginManager = new GlidePluginManager();
		if (!pluginManager.isActive('com.glide.cs.actionable.notification'))
			return false;
		
		// If com.glide.cs.actionable.notification is installed, check if the content class is va chat or messaging
		var contentClass = this.getParameter('sysparm_content_class') + '';
		
		return contentClass === 'sys_notification_va_content' || contentClass === 'sys_notification_va_content_messaging';
	},
	
	
    type: 'ProviderNotificationAjax'
});
