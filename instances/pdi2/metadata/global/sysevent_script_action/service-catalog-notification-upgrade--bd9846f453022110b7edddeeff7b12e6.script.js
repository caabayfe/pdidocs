gs.info("notification script trigger started");
var requestNotification = new global.RequestNotificationUpgradeUtil();
requestNotification.updateRequestNotifications();
gs.info("notification script trigger ended");
