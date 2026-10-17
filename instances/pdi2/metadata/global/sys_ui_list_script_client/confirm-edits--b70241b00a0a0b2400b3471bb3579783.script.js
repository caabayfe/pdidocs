function onSubmit() {
  var added = g_list.getAddedRowCount();
  var deleted = g_list.getDeletedRowCount();

  if (added == "0" && deleted == "0")
    return true;

  var message = "Confirm field modifications:\n";
  if (added != "0")
    message += "\n\tAdding " + added + " new field";

  if (deleted != "0")
    message += "\n\tDeleting " + deleted + " field";

  return confirm(message);
}
