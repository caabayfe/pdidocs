(function executeRule(current, previous /*null when async*/ ) {
    var nGr = new GlideRecord('notify_group');
    nGr.get(current.notify_group);
    if (!nGr.isValidField("execute_using_subflow")) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Voice only capable numbers can't be associated with number groups having inbound/outbound SMS subflows"));
    }
})(current, previous);
