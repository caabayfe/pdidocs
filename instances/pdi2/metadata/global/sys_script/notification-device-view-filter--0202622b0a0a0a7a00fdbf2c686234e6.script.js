function cmn_notif_deviceGetViewName() {
  if (gs.hasRole("itil")) 
     return; 
  if (view.startsWith("ess"))
     return;
  if (view === "concourse_notification_preferences")
     return;

  answer = "ess";
}

function cmn_notif_device_listGetViewName() {
  cmn_notif_deviceGetViewName();
}
