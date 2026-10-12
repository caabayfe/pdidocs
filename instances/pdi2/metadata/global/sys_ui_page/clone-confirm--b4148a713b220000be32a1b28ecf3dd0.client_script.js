function onOK() {
  var o = GlideDialogWindow.prototype.get('clone_confirm');
  var f = o.getPreference('onOK');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}

function onCancel() {
  var o = GlideDialogWindow.prototype.get('clone_confirm');
  var f = o.getPreference('onCancel');
  if (typeof(f) == 'function') {
    f();
    return;
  }
}
