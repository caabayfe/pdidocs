(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("This Related record context does not have the {0} reference field to match the provided {0} reference table value.", (gs.nil(current.related_record_context.parent_field) ? gs.getMessage("primary") : gs.getMessage("secondary"))));
    current.setAbortAction(true);

})(current, previous);
