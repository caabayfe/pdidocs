gs.getUser().setPreference("change_request.show_conflict_message", "false");
var notif = new UINotification("info");
notif.setText(gs.getMessage("Scheduling Conflict message disabled"));
notif.send();
action.setRedirectURL(current);
