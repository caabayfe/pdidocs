(function executeRule(current, previous /*null when async*/ ) {

    if (!current.translate_sub_flow && !current.detect_sub_flow) {
        gs.addErrorMessage(gs.getMessage("Either a detect or a translate subflow is required for a valid translator configuration"));
        current.setAbortAction(true);
    }

})(current, previous);
