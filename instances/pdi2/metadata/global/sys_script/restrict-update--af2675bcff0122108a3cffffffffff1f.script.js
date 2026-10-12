(function executeRule(current, previous /*null when async*/ ) {
    if (current.parent != previous.parent) {
        gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.data_classification", "The record cannot be updated. Please delete this record and recreate it"));
        current.setAbortAction(true);
    }
})(current, previous);
