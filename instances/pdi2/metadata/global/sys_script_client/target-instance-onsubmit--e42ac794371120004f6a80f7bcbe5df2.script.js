function onSubmit() {
  if (g_form.isNewRecord()) {
    var source = g_form.getValue("source");
    if (source == null || source == '' || source == 'false')
      _show("authenticatingTargetLoadingDiv");
  }
  return true;
}

function _show(id) {
  var el = $(id);
  if (el && el != null)
    el.style.display = 'block';
}
