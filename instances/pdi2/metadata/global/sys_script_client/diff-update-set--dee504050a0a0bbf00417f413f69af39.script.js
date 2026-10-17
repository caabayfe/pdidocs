function onLoad() {
   if (g_form.getValue("update_set") == "")
      return;

   var ga = new GlideAjax("DiffAjax");
   ga.addParam("sysparm_name", "diffUpdateHistory");
   ga.addParam("sysparm_sys_id", g_form.getUniqueValue());
   ga.addParam("sysparm_table_name", "sys_upgrade_history_log");
   ga.getXMLWait();
   var diff = ga.getAnswer();
   g_form.setValue("payload_diff",diff);
}
