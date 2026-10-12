function onOK() {
  var gdw = GlideDialogWindow.get();
  var f = gdw.getPreference('updateMeeting');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}

function onCancel() {
  var gdw = GlideDialogWindow.get();
  var f = gdw.getPreference('updateDefinition');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}
