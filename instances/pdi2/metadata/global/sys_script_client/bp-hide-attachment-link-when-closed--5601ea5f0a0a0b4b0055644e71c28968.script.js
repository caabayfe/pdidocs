function onLoad() {
   if (g_form.getValue('incident_state') == '7' || g_form.getValue('state') == '7')
      g_form.disableAttachments();
}
