function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue != "")
      return;

   if (typeof g_scratchpad.msg_public_kb == "undefined")
      return;

   g_form.showFieldMsg("roles", g_scratchpad.msg_public_kb);   
}
