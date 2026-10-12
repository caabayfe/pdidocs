(function executeRule(current, previous /*null when async*/ ) {
    gs.addInfoMessage(gs.getMessage("Cannot use same field '{0}' as criterion attribute and reference field for {1} !", [current.referenced_field, current.table]));
    current.setAbortAction(true);
    current.attributes = previous.attributes;
    current.referenced_field = previous.referenced_field;
})(current, previous);
