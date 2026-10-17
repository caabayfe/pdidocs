(function executeRule(current, previous /*null when async*/ ) {
    if (current.app_profile != previous.app_profile || current.target_scope != previous.target_scope) {
        gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.data_classification", "The record cannot be updated. Please delete this record and recreate it if needs update"));
        current.setAbortAction(true);
    }
})(current, previous);
