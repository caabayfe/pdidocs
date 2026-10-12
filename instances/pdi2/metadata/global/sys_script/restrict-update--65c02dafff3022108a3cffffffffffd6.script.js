(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(sn_i18n.Message.getMessage("com.glide.data_classification", "The record can not be updated. Please delete this record and recreate it"));
    current.setAbortAction(true);
})(current, previous);
