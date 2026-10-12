doAction();

var lastURL = gs.getSession().getStack().purge("notification_preferences.do");
if (lastURL == "welcome.do")
   lastURL = "home.do";

response.sendRedirect(lastURL);

function doAction() {
	if (sys_action == "cancel")
		return;
	
    var userID = getParameterByName("hidden_user_id");
	
	var ids = getParameterByName("notif_messages");
    var notifs = ids.split(',');
	for (var i =0; i < notifs.length; i++) {
		if (!notifs[i])
			continue;
		
		var messageSysId = notifs[i];
		var notif = new GlideRecord('cmn_notif_message');
        notif.get(messageSysId);	
		
		if (notif.notification.mandatory == true)
            continue;
		
		
		var messageValue = getParameterByName("message." + messageSysId);
		if (messageValue == 'on' && notif.notification_filter == "c1bfa4040a0a0b8b001eeb0f3f5ee961") {
            notif.notification_filter = '';
            notif.update();
         } else if (messageValue != 'on' && notif.notification_filter != "c1bfa4040a0a0b8b001eeb0f3f5ee961") {
            notif.notification_filter = 'c1bfa4040a0a0b8b001eeb0f3f5ee961';
            notif.update();
         }
	}
}

function getParameterByName(name) {
   var v = request.getParameterValues(name);
   if (v)
	   return v[0];
   return "";
}
