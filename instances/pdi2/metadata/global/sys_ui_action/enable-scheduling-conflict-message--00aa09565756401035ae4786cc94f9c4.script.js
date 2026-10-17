gs.getUser().setPreference("change_request.show_conflict_message", "true");
var notif = new UINotification("info");
notif.setText(gs.getMessage("Scheduling Conflict message enabled"));
notif.send();
action.setRedirectURL(current);
