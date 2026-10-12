function onCondition() {
  var mode = gel('ni_mode_sys_security_acl.name');
  if (mode) {
    var pref = getPreference("mode_sys_security_acl.name");
    if (pref == null || pref == '')
      pref = 'select';
    if (mode.value != pref) {
      mode.value = pref;
      setMyVisibility('sys_security_acl.name');
    }
  }
}
