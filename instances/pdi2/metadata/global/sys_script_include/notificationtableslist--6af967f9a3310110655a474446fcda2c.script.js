var NotificationTablesList = Class.create();
NotificationTablesList.prototype = {
	initialize: function() {
	},
	process: function(){
	var notif_tables= [];
	notif_tables.push("sysevent_email_action");
	notif_tables.push("sys_notification");
	return notif_tables;
	},

    type: 'NotificationTablesList'
};
