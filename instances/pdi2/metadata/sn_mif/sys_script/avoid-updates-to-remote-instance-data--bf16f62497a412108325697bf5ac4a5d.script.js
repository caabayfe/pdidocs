(function executeRule(current, previous /*null when async*/ ) {
    var op = new sn_mif_core.MIFVTableApi().getOperationByTableName(current.getTableName());
    if (!gs.nil(op)) {
        gs.addErrorMessage(gs.getMessage("Updating vtable remote data instance is not allowed."));
        current.setAbortAction(true);
    }
})(current, previous);
