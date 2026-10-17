function showConfirmationDlg(){
  var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
  var dialog = new dialogClass("contract_cancel_dialog");
  //dialog.setWidth("800");
  dialog.setTitle("Confirmation");
  dialog.setPreference("sys_id", g_form.getUniqueValue());
  assetSetDomainParameters(dialog);
  dialog.setWidth(400);
  dialog.render(); //Open the dialog
}
