execDelete();

function execDelete() {
    if (!current.isValidRecord()) {
        gs.log("Not deleting invalid record");
        return;
    }

    if (!current.canDelete()) {
        gs.log("Not deleting " + current.sys_id + " because of security constraints");
        gs.addInfoMessage(gs.getMessage('Skipping delete of {0} because of security constraints',current.getDisplayValue()));
        return;
    }

    current.deleteRecord();
    gs.log("Deleted " + current.getDisplayValue() + " (" + current.sys_id + ")" + " from " + current.getTableName());
}
