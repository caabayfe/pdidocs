function onSubmit() {
  return true;
}

function cancel() {
  var c = gel('cancelled');
  c.value = "true";
  GlideDialogWindow.get().destroy();
}
