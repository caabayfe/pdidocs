/**
 Service-now.com

 Description:  Refresh the navigator after a label is deleted.
**/
(function() {
	if (!gs.isInteractive())
		return;

	var displayName = GlideTableDescriptor.get(current.getTableName()).getLabel();
	var message = gs.getMessage("{0} {1} deleted", [displayName, GlideStringUtil.escapeHTML(current.name)]);
	// the legacy UI refreshes the nav because the tags appear there
	if (GlideMobileExtensions.getDeviceType() != 'doctype') {
		var notification = new UINotification('system_event');
		notification.setAttribute('event', 'refresh_nav');
		notification.send();
	}

	gs.addInfoMessage(message);
})();
