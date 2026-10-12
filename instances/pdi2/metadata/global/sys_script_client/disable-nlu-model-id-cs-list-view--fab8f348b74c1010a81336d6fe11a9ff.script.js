function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = false;
  alert(getMessage('NLU Model ID is deprecated and cannot be edited.'));

  callback(saveAndClose); 
}
