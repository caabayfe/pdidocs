function onLoad() {
  var name = g_form.getValue("instance_name");
  if (name == null || name.length == 0)
    g_form.setValue("instance_name", "Standby Database");
}
