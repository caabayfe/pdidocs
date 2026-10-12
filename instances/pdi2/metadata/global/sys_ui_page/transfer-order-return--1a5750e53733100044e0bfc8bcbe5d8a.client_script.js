function cancel() {
  var c = gel('cancelled');
  c.value = "true";
  GlideDialogWindow.get().destroy();
  return false;
}

function actionOK() {
  var return_quantity_requested = trim(gel('return_quantity_requested').value);
  if ('' == return_quantity_requested) {
    alert(getMessage("Please specify Quantity"));
    return false;
  }
  var numeric_reg_exp = new RegExp("^[0-9]+$");
  var return_quantity_requested_int = parseInt(return_quantity_requested, 10);
  if (!numeric_reg_exp.test(return_quantity_requested) || (0 >= return_quantity_requested_int)) {
    alert(getMessage("Quantity must be a positive whole number"));
    return false;
  }

  var return_reason = trim(gel('return_reason').value);
  if ('' == return_reason) {
    alert(getMessage("Please specify Reason"));
    return false;
  }

  var quantity_received_int = parseInt(gel('quantity_received').value, 10);
  var quantity_returned_int = parseInt(gel('quantity_returned').value, 10);
  var max_quantity_returnable_int = quantity_received_int - quantity_returned_int;
  if (return_quantity_requested_int > max_quantity_returnable_int) {
    alert(getMessage('Quantity cannot be greater than ') + (max_quantity_returnable_int));
    return false;
  }

  return true;
}
