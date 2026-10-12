execDelete();

function execDelete() {
  var message = gs.getMessage('in execDelete');
	gs.addInfoMessage(message);
    if (!current.isValidRecord()) {
        gs.log("Not deleting invalid record");
        return;
    }

    if (!current.canDelete()) {
        gs.log("Not deleting " + current.sys_id + " because of security constraints");
        var infoMessage = gs.getMessage('Skipping delete of {0} because of security constraints',current.getDisplayValue());
        gs.addInfoMessage(infoMessage);
        return;
    }
    
    try {
        new DiscoveryFunctions().deleteCI(current, true);
    } catch (e) {
        current.deleteRecord();
    }
    
    gs.log("Deleted " + current.getDisplayValue() + " (" + current.sys_id + ")" + " from " + current.getTableName());
}
