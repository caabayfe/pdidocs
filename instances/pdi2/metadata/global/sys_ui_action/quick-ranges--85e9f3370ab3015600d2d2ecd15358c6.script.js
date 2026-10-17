function clickActivate() {
   sysId = gel('sys_uniqueValue').value;

  // bring up the UI page for the ranges entry...
  dlog = new GlideDialogWindow('quick_ranges', false, 620);
  dlog.setTitle('Quick Ranges');
  dlog.setPreference('mr_id', sysId);
  dlog.setPreference('mr_table', 'discovery_schedule');
  dlog.render();
}
