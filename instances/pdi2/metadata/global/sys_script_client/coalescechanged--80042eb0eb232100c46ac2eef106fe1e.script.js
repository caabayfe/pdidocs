function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = true;
    
 g_form.addInfoMessage('Coalesce settings changed. After all coalesce fields are configured, use the <b>Index Coalesce Fields</b> related link to check if a new database index is required.');
 callback(saveAndClose); 
}
