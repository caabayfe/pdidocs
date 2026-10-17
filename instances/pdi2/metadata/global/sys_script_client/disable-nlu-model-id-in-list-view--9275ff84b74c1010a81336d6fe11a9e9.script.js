function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = false;
 //Type appropriate comment here, and begin script below
 alert(getMessage('NLU Model ID is deprecated and cannot be edited.'));
 callback(saveAndClose); 
}
