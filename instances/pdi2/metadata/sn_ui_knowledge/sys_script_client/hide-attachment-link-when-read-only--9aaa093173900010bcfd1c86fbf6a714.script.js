function onLoad() {
   if (g_scratchpad.versioning.enabled && (g_form.getValue('workflow_state') == 'published' || g_form.getValue('workflow_state') == 'retired' || g_form.getValue('workflow_state') == 'outdated' || g_form.getValue('workflow_state') == 'pending_retirement'))
      g_form.disableAttachments();
}
