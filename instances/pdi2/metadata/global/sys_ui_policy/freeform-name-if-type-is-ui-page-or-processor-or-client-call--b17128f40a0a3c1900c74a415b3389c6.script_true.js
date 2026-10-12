function onCondition() {
  var mode = gel('ni_mode_sys_security_acl.name');
  if (mode) {
    mode.value = 'freeform';
    setMyVisibility('sys_security_acl.name');
  }
}
