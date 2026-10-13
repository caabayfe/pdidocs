function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = true;
 //Type appropriate comment here, and begin script below
	CustomEvent.fireAll('em.ruleMappingChanged');
 callback(saveAndClose); 
}
