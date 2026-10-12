function onLoad() {
   if (g_form.isNewRecord())
      return;

   var e = $("sys_display.wf_activity.vars.var__m_f84eda480a0a3c1800a6fa8c7badf346.field");
   if (!e) // it's not a Switch
      return;
   
   e.removeClassName("drop_down_element");
   e.setAttribute("onclick", "");
   e.setAttribute("title", "");
   e = $("wf_activity.vars.var__m_f84eda480a0a3c1800a6fa8c7badf346.type");
   if (e)
      e.setAttribute("disabled", true);
   e = $("sys_display.wf_activity.vars.var__m_f84eda480a0a3c1800a6fa8c7badf346.item_variable");
   if (e)
      e.setAttribute("disabled", true);
   e = $("lookup.wf_activity.vars.var__m_f84eda480a0a3c1800a6fa8c7badf346.item_variable");
   if (e)
      e.remove();
   $$('[name="wf_activity.vars.var__m_f84eda480a0a3c1800a6fa8c7badf346.item_variable.ui_policy_sensitive"]').invoke("remove");
}
