function onCellEdit(sysIDs, table, oldValues, newValue, callback) {
    callback(newValue.startsWith('arn:aws'));
}
