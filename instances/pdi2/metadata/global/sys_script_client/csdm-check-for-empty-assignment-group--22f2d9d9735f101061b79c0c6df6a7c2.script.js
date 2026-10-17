function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
  var saveAndClose = true;
  if (newValue === '') 
	saveAndClose = confirm('Clearing the Change group value will also clear it on CIs within its related dynamic CI group. Do you wish to continue?');
	
 callback(saveAndClose); 
}
