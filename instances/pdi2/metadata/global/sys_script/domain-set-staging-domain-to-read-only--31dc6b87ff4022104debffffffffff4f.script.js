(function executeRule(current, previous /*null when async*/ ) {
    current.setAbortAction(true);
    gs.addInfoMessage(sn_i18n.Message.getMessage('com.glide.domain.msp_extensions', 'The domain Staged for Deletion is read only and cannot be edited or deleted.'));
})(current, previous);
