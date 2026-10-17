gs.info("notification script trigger started");
var incidentNotification = new global.IncidentNotificationUtil();
incidentNotification.updateIncidentNotifications();
gs.info("notification script trigger ended");
