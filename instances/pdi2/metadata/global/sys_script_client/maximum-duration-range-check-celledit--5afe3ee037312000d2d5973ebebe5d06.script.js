function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
   var successValue = true;
   if (newValue < 5 || newValue > 30 * 24 * 60 * 60) {
      alert(getMessage('The maximum duration must be between 5 and 2,592,000 seconds (30 days)'));
      successValue = false;
   }
   callback(successValue);
}
