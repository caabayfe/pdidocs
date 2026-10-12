(function () {
	data.portal = $sp.getPortalRecord().getValue('sys_id');
	var notificationsUtil = new sn_ex_sp_notifs.PortalNotificationsUtil(data.portal);
	data.trayWidgetOptions = notificationsUtil.getNotificationsTrayWidgetOptions();
	data.trayWidgetOptions.openInNewTab = true;
})();
