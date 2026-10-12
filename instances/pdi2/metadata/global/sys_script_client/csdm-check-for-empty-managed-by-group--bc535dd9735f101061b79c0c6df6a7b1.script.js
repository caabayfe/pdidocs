function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
   var saveAndClose = true;
	
  if (newValue === '') 
	saveAndClose = confirm('Clearing the Managed by group value will also clear it on CIs within its related dynamic CI group or default to its class settings. Do you wish to continue?');
	
 callback(saveAndClose); 
}
