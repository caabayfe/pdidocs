function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '' || newValue == oldValue || g_form.isNewRecord()) {
      return;
   }

   var ga = new GlideRecord("sys_nowmq_subject");
    ga.addQuery("parent", g_form.getValue("subject"));
    ga.query();
    if (ga.next())
        g_form.showFieldMsg("value", getMessage("Changing the parameter's value can affect child subject's configuration"), "warning");
   
}
