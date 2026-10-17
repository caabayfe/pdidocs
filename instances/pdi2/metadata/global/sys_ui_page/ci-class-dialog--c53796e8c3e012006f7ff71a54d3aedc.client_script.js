function onOK() {
  var o = GlideDialogWindow.prototype.get('Ci_Class_Dialog');
  var f = o.getPreference('onOK');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}

function onCancel() {
  var o = GlideDialogWindow.prototype.get('Ci_Class_Dialog');
  var f = o.getPreference('onCancel');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}
