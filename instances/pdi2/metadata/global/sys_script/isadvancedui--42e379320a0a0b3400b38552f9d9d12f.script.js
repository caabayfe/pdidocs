function isAdvancedUI() {
  var user = gs.getUser();
  var pref = user.getPreference('glide.ui.advanced');
  if (pref == null || pref == '')
    pref = gs.getProperty('glide.ui.advanced');

  return pref == 'true';
}
