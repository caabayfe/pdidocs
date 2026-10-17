var gr = new GlideRecord('cmn_notif_message');
gr.addQuery("user", current.user);
gr.addQuery("device", current.device);
gr.addQuery("notification", current.notification);
gr.addQuery("configuration_item", current.configuration_item);
gr.query();
if (gr.next()) {
  gs.addInfoMessage(gs.getMessage("This notification is already associated with this device"));
  current.setAbortAction(true);
}
